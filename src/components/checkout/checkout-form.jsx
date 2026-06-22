'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radio } from '@/components/ui/radio';
import { useToast } from '@/components/ui/toast';
import useCartStore from '@/store/cart';
import { processOrder } from '@/actions/order';
import { getRazorpayOrderId, verifyRazorpayPayment } from '@/actions/payment';
import { getSessionCustomer } from '@/actions/customer-auth';
import { saveAddress } from '@/actions/customer-address';
import { formatPrice } from '@/lib/product';
import { checkoutSchema, validateForm } from '@/lib/validations';
import { Loader2, MapPin, Home, Briefcase, Plus } from 'lucide-react';

export default function CheckoutForm({ isPrepaid, setIsPrepaid, total }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { items, clearCart, getCartForCheckout } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [autofilling, setAutofilling] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [customerId, setCustomerId] = useState(null);
  const [errors, setErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { customer } = await getSessionCustomer();
        if (customer) {
          setCustomerId(customer.id);
          const addresses = customer.addresses || [];
          setSavedAddresses(addresses);

          const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];

          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            applyAddress(defaultAddress, customer.email, customer.phone);
          } else {
            setUseNewAddress(true);
            const nameParts = customer.name.split(' ');
            setFormData(prev => ({
              ...prev,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: customer.email,
              phone: customer.phone || '',
            }));
          }
        } else {
          setUseNewAddress(true);
        }
      } catch (err) {
        // Silently fail — user can fill manually
      } finally {
        setAutofilling(false);
      }
    };
    fetchCustomer();
  }, []);

  const applyAddress = (addr, email, phone) => {
    setFormData({
      firstName: addr.firstName,
      lastName: addr.lastName,
      email: email || formData.email,
      phone: addr.phone || phone || '',
      address: addr.address,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const selectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setUseNewAddress(false);
    applyAddress(addr, formData.email, formData.phone);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setUseNewAddress(true);
    setFormData(prev => ({
      ...prev,
      firstName: '', lastName: '', address: '', apartment: '',
      city: '', state: '', pincode: '', phone: '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: formatted });
      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
      return;
    }
    
    if (name === 'pincode') {
      const formatted = value.replace(/\D/g, '').slice(0, 6);
      setFormData({ ...formData, pincode: formatted });
      if (errors.pincode) setErrors(prev => ({ ...prev, pincode: undefined }));
      return;
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleRazorpayPayment = async (orderId, totalAmount, orderData) => {
    if (!window.Razorpay) {
      addToast({ title: 'Error', message: 'Payment SDK not loaded. Please refresh and try again.', type: 'error' });
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(totalAmount * 100), // in paise
      currency: 'INR',
      name: 'RoadsRide',
      description: 'Order Payment',
      image: '/rr.webp',
      order_id: orderId,
      handler: async function (response) {
        try {
          // 1. Verify Payment
          const verification = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verification.success) {
            // 2. Save Order to Database
            const completeOrderData = {
              ...orderData,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };

            const { success, orderId: dbOrderId, error } = await processOrder(completeOrderData);

            if (success) {
              // Save new address to customer profile
              if (useNewAddress && customerId) {
                saveAddress({ firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, address: formData.address, apartment: formData.apartment, city: formData.city, state: formData.state, pincode: formData.pincode, label: 'Other' }).catch(() => { });
              }
              router.push(`/order-success?id=${dbOrderId}`);
            } else {
              addToast({ title: 'Error', message: error || 'Failed to save order', type: 'error' });
              setLoading(false);
            }
          } else {
            addToast({ title: 'Payment Failed', message: 'Verification failed', type: 'error' });
            setLoading(false);
          }
        } catch (err) {
          addToast({ title: 'Error', message: 'Payment verification error', type: 'error' });
          setLoading(false);
        }
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: '#F5C400',
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', function (response) {
      addToast({ title: 'Payment Failed', message: response.error.description, type: 'error' });
      setLoading(false);
    });

    paymentObject.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      addToast({ title: 'Error', message: 'Your cart is empty', type: 'error' });
      return;
    }

    setLoading(true);
    setErrors({});

    const payloadToValidate = {
      ...formData,
      phone: formData.phone.length === 10 ? `+91${formData.phone}` : formData.phone
    };

    // Zod validation
    const validation = validateForm(checkoutSchema, payloadToValidate);
    if (!validation.success) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        ...payloadToValidate,
        paymentMethod: isPrepaid ? 'razorpay' : 'cod',
        items: getCartForCheckout(),
        total,
        customerId,
      };

      if (isPrepaid) {
        // 1. Create Razorpay Order
        const razorpayRes = await getRazorpayOrderId(total);
        if (!razorpayRes.success) {
          throw new Error('Failed to initialize payment');
        }

        // 2. Open Razorpay Checkout (saving happens inside on success)
        await handleRazorpayPayment(razorpayRes.id, total, orderData);
      } else {
        // COD - Save to DB immediately
        const { success, orderId, error } = await processOrder(orderData);

        if (!success) {
          throw new Error(error || 'Failed to process order');
        }

        // Save new address to customer profile
        if (useNewAddress && customerId) {
          saveAddress({ firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, address: formData.address, apartment: formData.apartment, city: formData.city, state: formData.state, pincode: formData.pincode, label: 'Other' }).catch(() => { });
        }

        router.push(`/order-success?id=${orderId}`);
      }
    } catch (err) {
      addToast({ title: 'Checkout Error', message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Autofill Loader */}
      {autofilling && (
        <div className="flex items-center gap-3 p-4 bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl animate-pulse">
          <Loader2 size={18} className="animate-spin text-brand-yellow" />
          <span className="text-sm font-medium text-brand-black">Auto-filling your saved details...</span>
        </div>
      )}

      {/* Contact Info */}
      <div>
        <h2 className="text-xl font-bold text-brand-black mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* Saved Address Picker (logged-in users) */}
      {savedAddresses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-brand-black mb-4">Delivery Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {savedAddresses.map(addr => (
              <button
                key={addr.id}
                type="button"
                onClick={() => selectAddress(addr)}
                className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedAddressId === addr.id && !useNewAddress
                  ? 'border-brand-yellow bg-brand-yellow/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1">
                    {addr.label === 'Home' ? <Home size={10} /> : addr.label === 'Office' ? <Briefcase size={10} /> : <MapPin size={10} />}
                    {addr.label || 'Address'}
                  </span>
                  {addr.isDefault && (
                    <span className="text-xs font-medium text-brand-yellow">Default</span>
                  )}
                </div>
                <p className="text-sm font-medium text-brand-black">{addr.firstName} {addr.lastName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{addr.address}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                <p className="text-xs text-gray-500">{addr.city}, {addr.state} {addr.pincode}</p>
              </button>
            ))}

            {/* Use a different address */}
            <button
              type="button"
              onClick={handleUseNewAddress}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[100px] ${useNewAddress
                ? 'border-brand-yellow bg-brand-yellow/5'
                : 'border-gray-300 hover:border-gray-400 text-gray-500'
                }`}
            >
              <Plus size={20} className={useNewAddress ? 'text-brand-yellow mb-1' : 'text-gray-400 mb-1'} />
              <span className="text-sm font-medium">Use a different address</span>
            </button>
          </div>
        </div>
      )}

      {/* Shipping Address Form (show for new address or guest) */}
      {(useNewAddress || savedAddresses.length === 0) && (
        <div>
          <h2 className="text-xl font-bold text-brand-black mb-4">{savedAddresses.length > 0 ? 'New Address' : 'Shipping Address'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'border-red-400' : ''}
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <Input
                label="Last Name"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'border-red-400' : ''}
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
            <div className="md:col-span-2">
              <Input
                label="Address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? 'border-red-400' : ''}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div className="md:col-span-2">
              <Input
                label="Apartment, suite, etc."
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
              />
            </div>
            <div>
              <Input
                label="City"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'border-red-400' : ''}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div>
              <Input
                label="State"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? 'border-red-400' : ''}
              />
              {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
            </div>
            <div>
              <Input
                label="PIN Code"
                name="pincode"
                type="tel"
                required
                value={formData.pincode}
                onChange={handleChange}
                className={errors.pincode ? 'border-red-400' : ''}
              />
              {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            </div>
            <div>
              <Input
                label="Phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'border-red-400' : ''}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div>
        <h2 className="text-xl font-bold text-brand-black mb-4">Payment Method</h2>
        <div className="space-y-3 bg-gray-50 p-4 border border-brand-border rounded-xl">
          <div className={`p-4 border rounded-lg transition-colors ${isPrepaid ? 'border-brand-black bg-white' : 'border-transparent'}`}>
            <Radio
              name="payment"
              value="prepaid"
              label="Online Payment (UPI, Cards, Wallets)"
              description="Get 5% instant discount on online payments. Safe & Secure."
              checked={isPrepaid}
              onChange={() => setIsPrepaid(true)}
            />
          </div>
          <div className={`p-4 border rounded-lg transition-colors ${!isPrepaid ? 'border-brand-black bg-white' : 'border-transparent'}`}>
            <Radio
              name="payment"
              value="cod"
              label="Cash on Delivery (COD)"
              description="Pay at your doorstep when you receive the product."
              checked={!isPrepaid}
              onChange={() => setIsPrepaid(false)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" size="xl" className="w-full text-lg" disabled={loading}>
        {loading ? 'Processing...' : isPrepaid ? `Pay ${formatPrice(total)}` : 'Place Order (COD)'}
      </Button>
    </form>
  );
}
