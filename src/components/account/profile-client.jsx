'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Camera, Package, User, LogOut, MapPin, Edit, Save, X, Calendar, ShieldCheck, Loader2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { customerLogout, updateCustomerProfile } from '@/actions/customer-auth';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { formatPrice } from '@/lib/product';

export default function ProfileClient({ customer, orderCount, recentOrders }) {
  const router = useRouter();
  const { addToast } = useToast();
  const avatarInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(customer.avatar);
  const [profileData, setProfileData] = useState({
    name: customer.name,
    phone: customer.phone || '',
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

  const memberSince = new Date(customer.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    banned: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-gray-50 min-h-[70vh] py-8 md:py-12">
      <div className="w-full px-4 sm:px-6" style={{ maxWidth: '1170px', margin: '0 auto' }}>

        {/* ── PROFILE HEADER (Discord/Shopify style) ── */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-28 md:h-36 bg-gradient-to-r from-brand-yellow via-amber-400 to-yellow-300 relative" />

          {/* Profile Info */}
          <div className="px-6 md:px-8 pb-6 -mt-14 md:-mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Avatar with Camera Overlay */}
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

              {/* Name + Info */}
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

              {/* Stats */}
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <Link href="/account" className="flex items-center gap-3 p-3 bg-brand-yellow/10 text-brand-black font-semibold rounded-lg border border-brand-yellow">
              <User size={18} />
              Account Details
            </Link>
            <Link href="/account/orders" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 hover:text-brand-black font-medium rounded-lg transition-colors">
              <Package size={18} />
              My Orders
            </Link>
            <Link href="/account/addresses" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 hover:text-brand-black font-medium rounded-lg transition-colors">
              <MapPin size={18} />
              Saved Addresses
            </Link>
            <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors cursor-pointer">
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Personal Profile */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-black">Personal Profile</h2>
                {editing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}><X size={14} className="mr-1"/>Cancel</Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover">
                      {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1"/>}
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit size={14} className="mr-2"/>Edit</Button>
                )}
              </div>

              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (cannot change)</label>
                    <Input value={customer.email} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <Input
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Full Name</p>
                      <p className="font-medium text-brand-black">{customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                      <p className="font-medium text-brand-black">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                      <p className="font-medium text-brand-black">{customer.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
                      <p className="font-medium text-brand-black">{memberSince}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-brand-black">Recent Orders</h2>
                {recentOrders.length > 0 && (
                  <Link href="/track-order" className="text-sm font-medium text-brand-yellow-hover hover:text-brand-yellow">
                    View all →
                  </Link>
                )}
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-black mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm">When you place an order, it will appear here.</p>
                  <Link href="/#shop">
                    <Button className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-semibold">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-yellow/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-brand-black">#{order.orderNumber}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.orderStatus === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <p className="font-bold text-brand-black">{formatPrice(order.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
