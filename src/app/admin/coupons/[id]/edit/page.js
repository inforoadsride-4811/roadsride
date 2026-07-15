import { getAdminCoupon } from '@/actions/admin-coupons';
import CouponForm from '../../coupon-form';
import { notFound } from 'next/navigation';

export default async function EditCouponPage({ params }) {
  const { id } = await params;
  const { success, coupon } = await getAdminCoupon(id);

  if (!success || !coupon) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-brand-black">Edit Coupon: {coupon.code}</h1>
        <p className="text-sm text-gray-500 mt-1">Update discount rules, limits, and active dates.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CouponForm initialData={coupon} />
      </div>
    </div>
  );
}
