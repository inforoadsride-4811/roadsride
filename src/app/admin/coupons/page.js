import { getAdminCoupons, getCouponAnalytics } from '@/actions/admin-coupons';
import Link from 'next/link';
import { Plus, Tag, TrendingUp, Users, AlertCircle, Calendar, History } from 'lucide-react';
import CouponsTable from './coupons-table';

export const dynamic = 'force-dynamic';

export default async function CouponsPage({ searchParams }) {
  const page = parseInt(searchParams?.page || '1');
  const search = searchParams?.search || '';
  const status = searchParams?.status || '';

  const [{ coupons, pagination }, analyticsRes] = await Promise.all([
    getAdminCoupons({ page, limit: 20, search, status }),
    getCouponAnalytics()
  ]);

  const stats = analyticsRes?.success ? analyticsRes.stats : {
    totalCoupons: 0, activeCoupons: 0, expiredCoupons: 0, totalRedemptions: 0, totalDiscountGiven: 0
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Coupons & Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promo codes and discount rules</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/coupons/history"
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <History size={18} />
            History
          </Link>
          <Link
            href="/admin/coupons/generate"
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Users size={18} />
            Bulk Generate
          </Link>
          <Link
            href="/admin/coupons/new"
            className="flex items-center gap-2 bg-brand-yellow text-brand-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            <Plus size={18} />
            Create Coupon
          </Link>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Coupons" 
          value={stats.activeCoupons} 
          icon={Tag} 
          subtitle={`${stats.totalCoupons} total coupons`} 
          color="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Total Redemptions" 
          value={stats.totalRedemptions} 
          icon={TrendingUp} 
          subtitle="All time usage" 
          color="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Discount Given" 
          value={`₹${stats.totalDiscountGiven.toLocaleString()}`} 
          icon={AlertCircle} 
          subtitle="Total savings given" 
          color="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          title="Expired Coupons" 
          value={stats.expiredCoupons} 
          icon={Calendar} 
          subtitle="Past campaigns" 
          color="bg-orange-100 text-orange-600" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CouponsTable 
          initialCoupons={coupons || []} 
          pagination={pagination || {}} 
          searchQuery={search}
          statusFilter={status}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
