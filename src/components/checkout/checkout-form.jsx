'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Radio } from '@/components/ui/radio';
import { useToast } from '@/components/ui/toast';
import useCartStore from '@/store/cart';
import { processOrder } from '@/actions/order';
import { getRazorpayOrderId, verifyRazorpayPayment } from '@/actions/payment';
import { formatPrice } from '@/lib/product';

export default function CheckoutForm({ isPrepaid, setIsPrepaid, total }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { items, clearCart, getCartForCheckout } = useCartStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderId, totalAmount, orderData) => {
    const res = await loadRazorpay();
    if (!res) {
      addToast({ title: 'Error', message: 'Razorpay SDK failed to load', type: 'error' });
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(totalAmount * 100), // in paise
      currency: 'INR',
      name: 'RoadsRide',
      description: 'Order Payment',
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

    try {
      const orderData = {
        ...formData,
        paymentMethod: isPrepaid ? 'razorpay' : 'cod',
        items: getCartForCheckout(),
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

        router.push(`/order-success?id=${orderId}`);
      }
    } catch (err) {
      addToast({ title: 'Checkout Error', message: err.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Info */}
      <div>
        <h2 className="text-xl font-bold text-brand-black mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="md:col-span-2"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h2 className="text-xl font-bold text-brand-black mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            label="Last Name"
            name="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
          />
          <Input
            label="Address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Input
            label="City"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
            />
            <Input
              label="PIN Code"
              name="pincode"
              required
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

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
