'use client';

import { formatPrice } from '@/lib/product';
import { Dialog } from '@/components/ui/dialog';

export default function DraftDetailModal({ draft, open, onClose }) {
  if (!draft) return null;

  return (
    <Dialog open={open} onClose={onClose} title="Draft Details" maxWidth="max-w-4xl">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Col: Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {[draft.firstName, draft.lastName].filter(Boolean).join(' ') || 'Not provided'}</p>
                <p><span className="font-medium">Email:</span> {draft.email || 'Not provided'}</p>
                <p><span className="font-medium">Phone:</span> {draft.phone || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border text-sm">
                {draft.address || draft.city || draft.state || draft.pincode ? (
                  <>
                    <p>{draft.address || 'No address line 1'}</p>
                    {draft.apartment && <p>{draft.apartment}</p>}
                    <p>{draft.city || 'No city'}, {draft.state || 'No state'} {draft.pincode || 'No pincode'}</p>
                  </>
                ) : (
                  <p className="text-gray-400">Address not provided</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Draft Status</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border space-y-2 text-sm">
                <p><span className="font-medium">Status:</span> <span className="capitalize">{draft.status}</span></p>
                <p><span className="font-medium">Created:</span> {new Date(draft.createdAt).toLocaleString()}</p>
                <p><span className="font-medium">Last Updated:</span> {new Date(draft.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Right Col: Items */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cart Items</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border space-y-4">
                {Array.isArray(draft.cartItems) ? draft.cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center text-xs text-gray-500">No Img</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">No items found</p>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(draft.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatPrice(draft.shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-200 mt-2">
                    <span>Total</span>
                    <span>{formatPrice(draft.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Dialog>
  );
}
