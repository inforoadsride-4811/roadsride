import { getCouponRedemptions } from '@/actions/admin-coupons';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, History, Search } from 'lucide-react';
import { formatPrice } from '@/lib/product';

export const dynamic = 'force-dynamic';

export default async function CouponHistoryPage({ searchParams }) {
  const page = parseInt(searchParams?.page || '1');
  const couponId = searchParams?.couponId || null;

  const { success, redemptions, pagination } = await getCouponRedemptions({ page, limit: 50, couponId });

  if (!success) {
    return <div className="p-6 text-red-500">Failed to load redemptions.</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons">
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-black flex items-center gap-2">
              <History size={24} className="text-brand-yellow" />
              Coupon Redemption History
            </h1>
            <p className="text-sm text-gray-500 mt-1">Log of all coupon uses across the store.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Coupon Used</th>
                <th className="px-6 py-4 font-semibold">Customer / Email</th>
                <th className="px-6 py-4 font-semibold">Order Total</th>
                <th className="px-6 py-4 font-semibold">Discount Applied</th>
                <th className="px-6 py-4 font-semibold">Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {redemptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-base font-medium text-gray-900">No redemptions found</p>
                  </td>
                </tr>
              ) : (
                redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: 'numeric', minute: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-black">{r.coupon?.code || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{r.coupon?.name || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{r.email}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(r.orderTotal)}
                    </td>
                    <td className="px-6 py-4 text-green-600 font-bold">
                      -{formatPrice(r.discountAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600 truncate max-w-[250px]" title={r.productName}>
                        {r.productName}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Basic Pagination Link (can be enhanced with client component later) */}
        {pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white mt-auto">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> redemptions
            </p>
            <div className="flex gap-2">
              {pagination.page > 1 && (
                <Link href={`/admin/coupons/history?page=${pagination.page - 1}${couponId ? `&couponId=${couponId}` : ''}`}>
                  <Button variant="outline" size="sm">Previous</Button>
                </Link>
              )}
              {pagination.page < pagination.totalPages && (
                <Link href={`/admin/coupons/history?page=${pagination.page + 1}${couponId ? `&couponId=${couponId}` : ''}`}>
                  <Button variant="outline" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
