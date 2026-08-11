'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { updateStoreSettings, getStoreSettings } from '@/actions/admin-products';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TABS = [
  { id: 'store', label: 'General Store Details' },
  { id: 'storefront', label: 'Storefront Display' },
  { id: 'payment', label: 'Payment Integration' },
  { id: 'email', label: 'Email Configuration' },
];

export default function SettingsClient({ initialSettings }) {
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(false);

  const { data: settingsData } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const res = await getStoreSettings();
      if (!res.success) throw new Error(res.error);
      return res.settings;
    },
    initialData: initialSettings
  });

  const settings = settingsData || initialSettings;

  const [formData, setFormData] = useState({
    // Store
    storeName: initialSettings.storeName || '',
    storeEmail: initialSettings.storeEmail || '',
    storePhone: initialSettings.storePhone || '',
    whatsappNumber: initialSettings.whatsappNumber || '',
    whatsappEnabledUrls: initialSettings.whatsappEnabledUrls || '',
    supportEmail: initialSettings.supportEmail || '',
    storeAddress: initialSettings.storeAddress || '',
    footerContent: initialSettings.footerContent || '',
    // Payment
    razorpayKeyId: initialSettings.razorpayKeyId || '',
    razorpayEnabled: initialSettings.razorpayEnabled ?? true,
    codEnabled: initialSettings.codEnabled ?? true,
    prepaidDiscountPercent: initialSettings.prepaidDiscountPercent || 0,
    defaultCurrency: initialSettings.defaultCurrency || 'INR',
    // Email
    resendSenderName: initialSettings.resendSenderName || '',
    resendSenderEmail: initialSettings.resendSenderEmail || '',
    resendReplyTo: initialSettings.resendReplyTo || '',
    emailsEnabled: initialSettings.emailsEnabled ?? true,
    // Storefront Display
    announcementEnabled: initialSettings.announcementEnabled ?? true,
    announcementText: initialSettings.announcementText || 'Cash on Delivery - 5% Discount on Prepaid Orders',
    announcementSpeed: settings.announcementSpeed || 30,
  });

  // Keep local state in sync if external settings change, only if no unsaved changes are present
  // For simplicity, we just initialize with the data above.
  
  const mutation = useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: (res) => {
      if (res.success) {
        addToast({ title: 'Success', message: 'Settings saved securely.', type: 'success' });
        queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
      } else {
        addToast({ title: 'Error', message: res.error, type: 'error' });
      }
    },
    onError: (error) => {
      addToast({ title: 'Error', message: error.message || 'Update failed', type: 'error' });
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dataToSave = { ...formData };
    // Ensure numerical values
    dataToSave.prepaidDiscountPercent = parseFloat(dataToSave.prepaidDiscountPercent) || 0;
    dataToSave.announcementSpeed = parseInt(dataToSave.announcementSpeed, 10) || 30;

    mutation.mutate(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-yellow/20 text-brand-black border border-brand-yellow font-bold'
                : 'text-gray-600 hover:bg-gray-100 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 min-h-[400px]">
          
          {/* STORE DETAILS */}
          {activeTab === 'store' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-brand-black mb-4 border-b pb-2">Store Profile</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <Input name="storeName" value={formData.storeName} onChange={handleChange} placeholder="RoadsRide" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                  <Input name="defaultCurrency" value={formData.defaultCurrency} onChange={handleChange} placeholder="INR" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Contact Email</label>
                  <Input name="storeEmail" value={formData.storeEmail} onChange={handleChange} placeholder="contact@domain.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Contact Phone</label>
                  <Input name="storePhone" value={formData.storePhone} onChange={handleChange} placeholder="+91..." />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Support Email</label>
                  <Input name="supportEmail" value={formData.supportEmail} onChange={handleChange} placeholder="support@domain.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <Input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Enabled URLs</label>
                <p className="text-xs text-gray-500 mb-2">Comma-separated URLs where the sticky button appears (e.g. <code className="bg-gray-100 px-1 rounded">/</code>, <code className="bg-gray-100 px-1 rounded">/product</code>, <code className="bg-gray-100 px-1 rounded">/*</code> for all)</p>
                <Input name="whatsappEnabledUrls" value={formData.whatsappEnabledUrls} onChange={handleChange} placeholder="/*" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                <textarea 
                  name="storeAddress" 
                  value={formData.storeAddress} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow outline-none min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Content</label>
                <textarea 
                  name="footerContent" 
                  value={formData.footerContent} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow outline-none min-h-[80px]"
                  placeholder="Short description displayed in the footer..."
                />
              </div>
            </div>
          )}

          {/* STOREFRONT */}
          {activeTab === 'storefront' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-brand-black mb-4 border-b pb-2">Announcement Marquee</h2>
              
              <div className="flex items-center gap-3 mb-6">
                <input type="checkbox" id="announcementEnabled" name="announcementEnabled" checked={formData.announcementEnabled} onChange={handleChange} className="w-4 h-4 text-brand-yellow" />
                <label htmlFor="announcementEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">Show Announcement Marquee at Top of Site</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marquee Text</label>
                <Input name="announcementText" value={formData.announcementText} onChange={handleChange} placeholder="e.g. Free Shipping on orders above ₹999!" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Animation Speed (Seconds)</label>
                <Input type="number" name="announcementSpeed" value={formData.announcementSpeed} onChange={handleChange} min="5" max="200" />
                <p className="text-xs text-gray-500 mt-1">Number of seconds for the text to do one full loop. Lower number = faster.</p>
              </div>
            </div>
          )}

          {/* PAYMENT */}
          {activeTab === 'payment' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-brand-black mb-4 border-b pb-2">Razorpay & Checkout</h2>
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-sm mb-6 border border-blue-100">
                <Info size={18} className="mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Security Notice:</strong> The <code className="bg-blue-100 px-1 rounded">RAZORPAY_KEY_SECRET</code> must be configured in your server&apos;s environment variables (<code>.env</code> file). It is intentionally excluded from this dashboard for security reasons.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID (Public)</label>
                <Input name="razorpayKeyId" value={formData.razorpayKeyId} onChange={handleChange} placeholder="rzp_test_..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="razorpayEnabled" name="razorpayEnabled" checked={formData.razorpayEnabled} onChange={handleChange} className="w-4 h-4 text-brand-yellow" />
                    <label htmlFor="razorpayEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">Enable Online Payments (Razorpay)</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="codEnabled" name="codEnabled" checked={formData.codEnabled} onChange={handleChange} className="w-4 h-4 text-brand-yellow" />
                    <label htmlFor="codEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">Enable Cash on Delivery (COD)</label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prepaid Discount Percentage (%)</label>
                  <Input type="number" name="prepaidDiscountPercent" value={formData.prepaidDiscountPercent} onChange={handleChange} min="0" max="100" />
                  <p className="text-xs text-gray-500 mt-1">Discount given when customer pays online.</p>
                </div>
              </div>
            </div>
          )}

          {/* EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-brand-black mb-4 border-b pb-2">Resend Email Provider</h2>
              
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-sm mb-6 border border-blue-100">
                <Info size={18} className="mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Security Notice:</strong> The <code className="bg-blue-100 px-1 rounded">RESEND_API_KEY</code> must be configured in your server&apos;s environment variables (<code>.env</code> file). It is intentionally excluded from this dashboard.
                </p>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <input type="checkbox" id="emailsEnabled" name="emailsEnabled" checked={formData.emailsEnabled} onChange={handleChange} className="w-4 h-4 text-brand-yellow" />
                <label htmlFor="emailsEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">Enable System Emails (Order Confirmations, etc.)</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                  <Input name="resendSenderName" value={formData.resendSenderName} onChange={handleChange} placeholder="RoadsRide Support" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
                  <Input name="resendSenderEmail" value={formData.resendSenderEmail} onChange={handleChange} placeholder="orders@yourdomain.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                <Input name="resendReplyTo" value={formData.resendReplyTo} onChange={handleChange} placeholder="support@yourdomain.com" />
              </div>
            </div>
          )}

        </div>

        {/* Action Bar */}
        <div className="p-4 bg-gray-50 border-t border-brand-border flex justify-end">
          <Button type="submit" disabled={loading} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-semibold px-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>
    </form>
  );
}
