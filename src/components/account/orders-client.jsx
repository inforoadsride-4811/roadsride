'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, User, MapPin, LogOut, FileText, ChevronDown, ChevronUp, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { customerLogout } from '@/actions/customer-auth';
import { formatPrice } from '@/lib/product';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  confirmed: { label: 'Confirmed', color: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Refunded', color: 'bg-purple-100 text-purple-700' },
};

export default function OrdersClient({ customer, orders }) {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState(null);

  const handleLogout = async () => {
    await customerLogout();
    router.push('/account/login');
    router.refresh();
  };

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  return (
    <div className="bg-gray-50 min-h-[70vh] py-8 md:py-12">
      <div className="w-full px-4 sm:px-6" style={{ maxWidth: '1170px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <Link href="/account" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 hover:text-brand-black font-medium rounded-lg transition-colors">
              <User size={18} />
              Account Details
            </Link>
            <Link href="/account/orders" className="flex items-center gap-3 p-3 bg-brand-yellow/10 text-brand-black font-semibold rounded-lg border border-brand-yellow">
              <Package size={18} />
              My Orders
            </Link>
            <Link href="/account/addresses" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 hover:text-brand-black font-medium rounded-lg transition-colors">
              <MapPin size={18} />
              Saved Addresses
            </Link>
            <button onClick={handleLogout} className="w-full mt-4 flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors cursor-pointer">
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm">
              <h2 className="text-xl font-bold text-brand-black mb-6">My Orders</h2>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Package size={36} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-black mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm">When you place an order, it will appear here with all details and invoice.</p>
                  <Link href="/#shop">
                    <Button className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-semibold">
                      Start Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const status = statusConfig[order.orderStatus] || statusConfig.pending;
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-brand-yellow/40 transition-colors">
                        {/* Order Header (always visible) */}
                        <button
                          onClick={() => toggleOrder(order.id)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                              <span className="font-bold text-brand-black">#{order.orderNumber}</span>
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${status.color}`}>
                                {status.label}
                              </span>
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                order.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {order.paymentMethod === 'cod' ? 'COD' : order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              {' · '}
                              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-brand-black text-lg">{formatPrice(order.total)}</span>
                            {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                          </div>
                        </button>

                        {/* Expanded Order Details */}
                        {isExpanded && (
                          <div className="p-4 sm:p-5 border-t border-gray-200 space-y-5">
                            {/* Items */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Items</h4>
                              <div className="space-y-3">
                                {order.items?.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                      {item.image ? (
                                        <Image src={item.image} alt={item.productName} width={56} height={56} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <Package size={20} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <Link href={`/product/${item.productSlug}`} className="text-sm font-medium text-brand-black hover:text-brand-yellow truncate block">
                                        {item.productName}
                                      </Link>
                                      {item.packName && <p className="text-xs text-gray-500">{item.packName}</p>}
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-brand-black text-sm">{formatPrice(item.price * item.quantity)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                                <div className="text-sm text-gray-600 space-y-0.5">
                                  <p className="font-medium text-brand-black">{order.customerName}</p>
                                  <p>{order.address}</p>
                                  {order.apartment && <p>{order.apartment}</p>}
                                  <p>{order.city}, {order.state} {order.pincode}</p>
                                  <p>{order.phone}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Discount</span>
                                      <span>-{formatPrice(order.discount)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-brand-black pt-1 border-t border-gray-200">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Tracking + Invoice Links */}
                            <div className="flex flex-wrap gap-3 pt-2">
                              {order.trackingUrl && (
                                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                  <ExternalLink size={14} />
                                  Track Shipment
                                </a>
                              )}
                              {order.trackingNumber && !order.trackingUrl && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg">
                                  Tracking: {order.trackingNumber}
                                </span>
                              )}
                              {order.invoiceUrl && (
                                <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                  <Download size={14} />
                                  Download Invoice
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
