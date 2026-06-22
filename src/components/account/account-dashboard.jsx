'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera, Package, User, LogOut, MapPin, Edit, Save, X, Calendar,
  ShieldCheck, Loader2, Mail, Phone, ChevronDown, ChevronUp,
  ExternalLink, Download, Plus, Trash2, Star, Home, Briefcase,
  Truck, Clock, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { customerLogout, updateCustomerProfile } from '@/actions/customer-auth';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { formatPrice } from '@/lib/product';
import { saveAddress, deleteAddress, setDefaultAddress } from '@/actions/customer-address';

// ── Status Config ──
const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  confirmed: { label: 'Confirmed', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700' },
};

const TRACKING_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function AccountDashboard({ customer, orderCount, orders, addresses: initialAddresses, initialTab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const avatarInputRef = useRef(null);

  // Active tab — synced with URL ?tab= param
  const [activeTab, setActiveTab] = useState(initialTab || 'profile');

  // Sync tab when URL changes (e.g. header link click)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['profile', 'orders', 'addresses'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Profile state
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(customer.avatar);
  const [profileData, setProfileData] = useState({
    name: customer.name,
    phone: customer.phone || '',
  });

  // Orders state
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Addresses state
  const [addresses, setAddresses] = useState(initialAddresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home', firstName: '', lastName: '', phone: '',
    address: '', apartment: '', city: '', state: '', pincode: '',
  });

  // ── Avatar Upload ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadFile(file, BUCKETS.CUSTOMERS, 'avatars/');
    if (result.success) {
      setAvatar(result.url);
      await updateCustomerProfile({ avatar: result.url });
      addToast({ title: 'Profile picture updated!', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Upload failed', message: result.error, type: 'error' });
    }
    setUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // ── Save Profile ──
  const handleSave = async () => {
    setSaving(true);
    const result = await updateCustomerProfile(profileData);
    if (result.success) {
      addToast({ title: 'Profile updated!', type: 'success' });
      setEditing(false);
      router.refresh();
    } else {
      addToast({ title: 'Update failed', message: result.error, type: 'error' });
    }
    setSaving(false);
  };

  // ── Logout ──
  const handleLogout = async () => {
    await customerLogout();
    router.push('/account/login');
    router.refresh();
  };

  // ── Address Actions ──
  const resetAddressForm = () => {
    setAddressForm({ label: 'Home', firstName: '', lastName: '', phone: '', address: '', apartment: '', city: '', state: '', pincode: '' });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressLoading(true);
    const result = await saveAddress({ ...addressForm, id: editingAddress });
    if (result.success) {
      addToast({ title: editingAddress ? 'Address updated!' : 'Address saved!', type: 'success' });
      resetAddressForm();
      router.refresh();
      // Optimistic update
      if (editingAddress) {
        setAddresses(prev => prev.map(a => a.id === editingAddress ? { ...a, ...addressForm } : a));
      } else if (result.address) {
        setAddresses(prev => [...prev, result.address]);
      }
    } else {
      addToast({ title: 'Failed', message: result.error, type: 'error' });
    }
    setAddressLoading(false);
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    const result = await deleteAddress(id);
    if (result.success) {
      setAddresses(prev => prev.filter(a => a.id !== id));
      addToast({ title: 'Address deleted', type: 'success' });
    } else {
      addToast({ title: 'Failed', message: result.error, type: 'error' });
    }
  };

  const handleSetDefault = async (id) => {
    const result = await setDefaultAddress(id);
    if (result.success) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      addToast({ title: 'Default address updated', type: 'success' });
    }
  };

  const startEditAddress = (addr) => {
    setAddressForm({
      label: addr.label || 'Home',
      firstName: addr.firstName,
      lastName: addr.lastName,
      phone: addr.phone,
      address: addr.address,
      apartment: addr.apartment || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setEditingAddress(addr.id);
    setShowAddressForm(true);
  };

  const memberSince = new Date(customer.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
  };

  const tabs = [
    { id: 'profile', label: 'Account Details', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  ];

  return (
    <div className="bg-gray-50 min-h-[100vh] py-8 md:py-12">
      <div className="w-full px-4 sm:px-6" style={{ maxWidth: '1170px', margin: '0 auto' }}>

        {/* ── PROFILE HEADER ── */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden mb-8">
          <div className="h-28 md:h-36 bg-gradient-to-r from-brand-yellow via-amber-400 to-yellow-300 relative" />
          <div className="px-6 md:px-8 pb-6 -mt-14 md:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden">
                  {avatar ? (
                    <Image src={avatar} alt={customer.name} width={128} height={128} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow to-amber-400">
                      <span className="text-4xl font-bold text-white">{customer.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin text-brand-black" /> : <Camera size={14} className="text-brand-black" />}
                </button>
                <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" />
              </div>

              <div className="flex-1 pt-2 sm:pt-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-brand-black">{customer.name}</h1>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[customer.status] || 'bg-gray-100 text-gray-800'}`}>
                    {customer.status?.charAt(0).toUpperCase() + customer.status?.slice(1)}
                  </span>
                  {customer.emailVerified && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1 text-sm">{customer.email}</p>
              </div>

              <div className="flex gap-6 pt-2 sm:pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-black">{orderCount}</p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-brand-black">{memberSince}</p>
                  <p className="text-xs text-gray-500">Member Since</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); router.push(`/account${tab.id === 'profile' ? '' : `?tab=${tab.id}`}`, { scroll: false }); }}
                className={`w-full flex items-center gap-3 p-3 font-medium rounded-lg transition-colors cursor-pointer text-left ${activeTab === tab.id
                  ? 'bg-brand-yellow/10 text-brand-black font-semibold border border-brand-yellow'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-brand-black border border-transparent'
                  }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors cursor-pointer">
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* ── CONTENT PANEL ── */}
          <div className="md:col-span-3 space-y-6">

            {/* ═══════ TAB: PROFILE ═══════ */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-brand-black">Personal Profile</h2>
                  {editing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(false)}><X size={14} className="mr-1" />Cancel</Button>
                      <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover">
                        {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit size={14} className="mr-2" />Edit</Button>
                  )}
                </div>

                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <Input value={profileData.name} onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
                      <Input value={customer.email} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <Input value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div><p className="text-xs text-gray-400 mb-0.5">Full Name</p><p className="font-medium text-brand-black">{customer.name}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div><p className="text-xs text-gray-400 mb-0.5">Email Address</p><p className="font-medium text-brand-black">{customer.email}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div><p className="text-xs text-gray-400 mb-0.5">Phone Number</p><p className="font-medium text-brand-black">{customer.phone || 'Not set'}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div><p className="text-xs text-gray-400 mb-0.5">Member Since</p><p className="font-medium text-brand-black">{memberSince}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ TAB: ORDERS ═══════ */}
            {activeTab === 'orders' && (
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
                <h2 className="text-xl font-bold text-brand-black mb-6">My Orders</h2>

                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package size={36} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-black mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">When you place an order, it will appear here with all details and invoice.</p>
                    <Link href="/#shop">
                      <Button className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-semibold">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = statusConfig[order.orderStatus] || statusConfig.pending;
                      const isExpanded = expandedOrder === order.id;
                      return (
                        <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-yellow/40 transition-colors">
                          <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full flex items-center justify-between p-4 sm:p-5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <span className="font-bold text-brand-black">#{order.orderNumber}</span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {order.paymentMethod === 'cod' ? 'COD' : (order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1))}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                {' · '}{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-brand-black text-lg">{formatPrice(order.total)}</span>
                              {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="p-4 sm:p-5 border-t border-gray-200 space-y-5">
                              {/* ── Tracking Timeline ── */}
                              {order.orderStatus !== 'cancelled' && order.orderStatus !== 'refunded' ? (
                                <div className="bg-gray-50 rounded-xl p-5">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Order Tracking</h4>
                                  <div className="relative">
                                    <div className="flex justify-between items-start">
                                      {TRACKING_STEPS.map((step, index) => {
                                        const currentIdx = TRACKING_STEPS.findIndex(s => s.id === order.orderStatus);
                                        const isCompleted = index <= currentIdx;
                                        const isCurrent = index === currentIdx;
                                        const StepIcon = step.icon;
                                        return (
                                          <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
                                            {index > 0 && (
                                              <div className={`absolute top-5 -left-1/2 w-full h-0.5 -z-10 ${index <= currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                                            )}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isCompleted
                                              ? 'bg-green-500 border-green-500 text-white'
                                              : 'bg-white border-gray-300 text-gray-400'
                                              } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                                              <StepIcon size={18} />
                                            </div>
                                            <p className={`text-xs font-semibold mt-2 text-center ${isCurrent ? 'text-brand-black' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                              }`}>{step.label}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className={`rounded-xl p-4 text-center text-sm font-semibold ${order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                                  }`}>
                                  {order.orderStatus === 'cancelled' ? 'This order has been cancelled.' : 'This order has been refunded.'}
                                </div>
                              )}

                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Items</h4>
                                <div className="space-y-3">
                                  {order.items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                          <Image src={item.image} alt={item.productName} width={56} height={56} className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <Link href={`/product/${item.productSlug}`} className="text-sm font-medium text-brand-black hover:text-brand-yellow truncate block">{item.productName}</Link>
                                        {item.packName && <p className="text-xs text-gray-500">{item.packName}</p>}
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                      </div>
                                      <p className="font-semibold text-brand-black text-sm">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                                  <div className="text-sm text-gray-600 space-y-0.5">
                                    <p className="font-medium text-brand-black">{order.customerName}</p>
                                    <p>{order.address}</p>
                                    {order.apartment && <p>{order.apartment}</p>}
                                    <p>{order.city}, {order.state} {order.pincode}</p>
                                    <p>{order.phone}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
                                  <div className="text-sm space-y-1">
                                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                                    {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
                                    <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
                                    <div className="flex justify-between font-bold text-brand-black pt-1 border-t border-gray-200"><span>Total</span><span>{formatPrice(order.total)}</span></div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 pt-2">
                                {order.trackingUrl && (
                                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                    <ExternalLink size={14} /> Track Shipment
                                  </a>
                                )}
                                {order.trackingNumber && !order.trackingUrl && (
                                  <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg">Tracking: {order.trackingNumber}</span>
                                )}
                                {order.invoiceUrl && (
                                  <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Download size={14} /> Download Invoice
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══════ TAB: ADDRESSES ═══════ */}
            {activeTab === 'addresses' && (
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-brand-black">Saved Addresses</h2>
                  {!showAddressForm && (
                    <Button size="sm" onClick={() => { resetAddressForm(); setShowAddressForm(true); }} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover">
                      <Plus size={14} className="mr-1" /> Add Address
                    </Button>
                  )}
                </div>

                {/* Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="mb-6 p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-brand-black">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                      <button type="button" onClick={resetAddressForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>

                    {/* Label selector */}
                    <div className="flex gap-2">
                      {['Home', 'Office', 'Other'].map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setAddressForm(p => ({ ...p, label }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${addressForm.label === label ? 'border-brand-yellow bg-brand-yellow/10 text-brand-black font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {label === 'Home' ? <Home size={14} /> : label === 'Office' ? <Briefcase size={14} /> : <MapPin size={14} />}
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="First Name" required value={addressForm.firstName} onChange={(e) => setAddressForm(p => ({ ...p, firstName: e.target.value }))} />
                      <Input label="Last Name" required value={addressForm.lastName} onChange={(e) => setAddressForm(p => ({ ...p, lastName: e.target.value }))} />
                      <div className="sm:col-span-2">
                        <Input label="Phone" type="tel" required value={addressForm.phone} onChange={(e) => setAddressForm(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <Input label="Address" required value={addressForm.address} onChange={(e) => setAddressForm(p => ({ ...p, address: e.target.value }))} />
                      </div>
                      <div className="sm:col-span-2">
                        <Input label="Apartment, suite, etc." value={addressForm.apartment} onChange={(e) => setAddressForm(p => ({ ...p, apartment: e.target.value }))} />
                      </div>
                      <Input label="City" required value={addressForm.city} onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))} />
                      <Input label="State" required value={addressForm.state} onChange={(e) => setAddressForm(p => ({ ...p, state: e.target.value }))} />
                      <Input label="PIN Code" required value={addressForm.pincode} onChange={(e) => setAddressForm(p => ({ ...p, pincode: e.target.value }))} />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="submit" disabled={addressLoading} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover">
                        {addressLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
                        {editingAddress ? 'Update' : 'Save Address'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetAddressForm}>Cancel</Button>
                    </div>
                  </form>
                )}

                {/* Address Cards */}
                {addresses.length === 0 && !showAddressForm ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MapPin size={36} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-black mb-2">No saved addresses</h3>
                    <p className="text-gray-500 mb-6 max-w-sm">Add a delivery address for faster checkout.</p>
                    <Button onClick={() => { resetAddressForm(); setShowAddressForm(true); }} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-semibold">
                      <Plus size={14} className="mr-1" /> Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`relative p-4 rounded-xl border-2 transition-colors ${addr.isDefault ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {addr.label === 'Home' ? '🏠' : addr.label === 'Office' ? '🏢' : '📍'} {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-xs font-semibold bg-brand-yellow/20 text-brand-black px-2 py-0.5 rounded flex items-center gap-1">
                              <Star size={10} /> Default
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-brand-black text-sm">{addr.firstName} {addr.lastName}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{addr.address}{addr.apartment ? `, ${addr.apartment}` : ''}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{addr.phone}</p>

                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                          <button onClick={() => startEditAddress(addr)} className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Edit</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer">Delete</button>
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr.id)} className="text-xs font-medium text-gray-500 hover:text-brand-black cursor-pointer">Set as Default</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
