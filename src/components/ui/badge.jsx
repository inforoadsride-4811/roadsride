const badgeVariants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-50 text-green-700 border border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  brand: 'bg-brand-yellow/10 text-brand-black border border-brand-yellow/30',
  discount: 'bg-brand-danger text-white',
  pending: 'bg-orange-50 text-orange-700 border border-orange-200',
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border border-purple-200',
  shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
  paid: 'bg-green-50 text-green-700 border border-green-200',
  failed: 'bg-red-50 text-red-700 border border-red-200',
};

export function Badge({ variant = 'default', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${badgeVariants[variant] || badgeVariants.default} ${className}`}
    >
      {children}
    </span>
  );
}

export function getOrderStatusVariant(status) {
  const map = {
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };
  return map[status] || 'default';
}

export function getPaymentStatusVariant(status) {
  const map = {
    pending: 'pending',
    paid: 'paid',
    failed: 'failed',
  };
  return map[status] || 'default';
}
