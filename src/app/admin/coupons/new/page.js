import CouponForm from '../coupon-form';

export default function NewCouponPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-brand-black">Create New Coupon</h1>
        <p className="text-sm text-gray-500 mt-1">Configure discount rules, limits, and active dates.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <CouponForm />
      </div>
    </div>
  );
}
