'use client';

import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/product';

const STATUS_STEPS = [
  { id: 'pending', label: 'Order Placed', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function TrackingResult({ order }) {
  if (!order) return null;

  const currentStatusIndex = STATUS_STEPS.findIndex(s => s.id === order.orderStatus) || 0;
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-brand-border">
          <div>
            <p className="text-sm text-gray-500 font-medium">Order Number</p>
            <p className="text-xl font-bold text-brand-black">{order.orderNumber}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-gray-500 font-medium">Order Date</p>
            <p className="text-brand-black font-semibold">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        {isCancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700">
            <h3 className="text-lg font-bold mb-1">Order Cancelled</h3>
            <p className="text-sm">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="relative pt-6 pb-12 overflow-x-auto">
            <div className="min-w-[500px] px-4">
              {/* Progress Line */}
              <div className="absolute top-11 left-8 right-8 h-1 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-brand-success transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="flex justify-between">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center relative z-10 w-16">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted 
                            ? 'bg-brand-success border-brand-success text-white' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <p className={`text-xs font-semibold mt-3 text-center ${
                        isCurrent ? 'text-brand-black' : isCompleted ? 'text-brand-success' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-brand-black mb-4">Order Details</h3>
        
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-semibold text-sm text-brand-black">{item.productName}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-sm text-brand-black">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-brand-border flex justify-between items-center">
          <span className="font-bold text-brand-black text-lg">Total</span>
          <span className="font-bold text-brand-black text-xl">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
