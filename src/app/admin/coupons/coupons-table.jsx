'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Search, Tag, Filter, Edit, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { deleteCoupon } from '@/actions/admin-coupons';

export default function CouponsTable({ initialCoupons, pagination, searchQuery, statusFilter }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [search, setSearch] = useState(searchQuery || '');
  const [status, setStatus] = useState(statusFilter || '');
  const [isDeleting, setIsDeleting] = useState(null);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    router.push(`/admin/coupons?${params.toString()}`);
  };

  const handleFilter = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (newStatus) params.set('status', newStatus);
    router.push(`/admin/coupons?${params.toString()}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) return;
    setIsDeleting(id);
    const { success, error } = await deleteCoupon(id);
    if (success) {
      addToast({ title: 'Coupon deleted', type: 'success' });
      setCoupons(coupons.filter(c => c.id !== id));
    } else {
      addToast({ title: 'Error', message: error, type: 'error' });
    }
    setIsDeleting(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </form>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={status}
            onChange={handleFilter}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-brand-yellow outline-none bg-white w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Code / Name</th>
              <th className="px-6 py-4 font-semibold">Discount</th>
              <th className="px-6 py-4 font-semibold">Usage</th>
              <th className="px-6 py-4 font-semibold">Validity</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Tag size={32} className="text-gray-300 mb-3" />
                    <p className="text-base font-medium text-gray-900">No coupons found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-50 text-brand-yellow rounded-lg">
                        <Tag size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-brand-black tracking-wide">{coupon.code}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{coupon.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : 
                       coupon.discountType === 'fixed' ? `₹${coupon.discountValue} off` : 
                       `₹${coupon.discountValue} fixed`}
                    </div>
                    {coupon.minOrderAmount > 0 && (
                      <div className="text-xs text-gray-500 mt-0.5">Min: ₹{coupon.minOrderAmount}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <TrendingUp size={14} className="text-blue-500" />
                        {coupon.usedCount} {coupon.maxTotalUses ? `/ ${coupon.maxTotalUses}` : 'uses'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={12} className="text-gray-400" />
                        {formatDate(coupon.startDate)}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <span className="text-gray-400 ml-1">to</span>
                        {formatDate(coupon.endDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/coupons/${coupon.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:text-brand-yellow hover:bg-yellow-50">
                          <Edit size={18} />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-gray-600 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(coupon.id)}
                        disabled={isDeleting === coupon.id}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white mt-auto">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> coupons
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set('search', search);
                if (status) params.set('status', status);
                params.set('page', pagination.page - 1);
                router.push(`/admin/coupons?${params.toString()}`);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => {
                const params = new URLSearchParams();
                if (search) params.set('search', search);
                if (status) params.set('status', status);
                params.set('page', pagination.page + 1);
                router.push(`/admin/coupons?${params.toString()}`);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
