'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerStatus } from '@/actions/customer';
import { useToast } from '@/components/ui/toast';
import { Mail, Phone, Calendar, Monitor, Smartphone, Globe, CreditCard, ShoppingBag, MapPin, AlertCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function CustomerProfileClient({ customer }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(customer.status);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    
    if (newStatus === 'banned' && !confirm('Are you sure you want to ban this customer? They will not be able to log in or purchase.')) return;
    
    setLoading(true);
    const { success, error } = await updateCustomerStatus(customer.id, newStatus);
    setLoading(false);

    if (success) {
      setStatus(newStatus);
      addToast({ title: 'Status updated successfully', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Failed to update', message: error, type: 'error' });
    }
  };

  const { analytics } = customer;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Profile Card & Device Info */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
          {status === 'banned' && <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>}
          {status === 'suspended' && <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>}
          
          <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
            {customer.avatar ? (
              <img src={customer.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-4" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow-dark font-bold text-3xl mb-4 border-4 border-white shadow-md">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Account Status:</span>
              <select
                disabled={loading}
                value={status}
                onChange={handleStatusChange}
                className={`text-sm px-3 py-1 rounded-full font-semibold border-none outline-none cursor-pointer appearance-none ${
                  status === 'active' ? 'bg-green-100 text-green-700' :
                  status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                  status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Mail size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                <p className="font-medium text-gray-900 truncate">{customer.email}</p>
              </div>
            </div>

            {customer.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                  <p className="font-medium text-gray-900">{customer.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Registered On</p>
                <p className="font-medium text-gray-900">{new Date(customer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Device Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert size={18} className="text-gray-400" /> Security & Device Activity
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-2"><Smartphone size={16} /> Last Device</span>
              <span className="font-medium text-gray-900">{customer.lastLoginDevice || 'Unknown'} / {customer.lastLoginPlatform || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-2"><Globe size={16} /> Last Browser</span>
              <span className="font-medium text-gray-900">{customer.lastLoginBrowser || 'Unknown'}</span>
            </div>

            <div className="flex items-center justify-between text-sm pb-3 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-2"><MapPin size={16} /> IP Address</span>
              <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">{customer.lastLoginIp || 'Not logged'}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Active</span>
              <span className="font-medium text-gray-900">
                {customer.lastActiveDate ? new Date(customer.lastActiveDate).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Analytics & Order History */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 text-brand-yellow-dark mb-2">
              <div className="p-2 bg-brand-yellow/10 rounded-lg"><ShoppingBag size={20} /></div>
              <span className="font-medium text-sm">Total Orders</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{analytics.totalOrders}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 text-green-600 mb-2">
              <div className="p-2 bg-green-50 rounded-lg"><CreditCard size={20} /></div>
              <span className="font-medium text-sm">Total Spend</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">₹{analytics.totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:col-span-1 col-span-2">
            <div className="flex items-center gap-3 text-blue-600 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg"><Monitor size={20} /></div>
              <span className="font-medium text-sm">Average Order Value</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">₹{Math.round(analytics.averageOrderValue).toLocaleString()}</p>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Order History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customer.orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  customer.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="font-semibold text-brand-black hover:text-brand-yellow-dark transition-colors underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{order.paymentMethod}</span>
                        {order.paymentStatus === 'paid' && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Paid</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">
                        ₹{order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
