import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Package } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { getOrderDetails } from '@/actions/tracking';
import { formatPrice } from '@/lib/product';
import ClearCart from '@/components/cart/clear-cart';

export const metadata = {
  title: 'Order Successful | RoadsRide',
  description: 'Thank you for your order.',
};

export default async function OrderSuccessPage({ searchParams }) {
  const { id } = await searchParams;
  
  if (!id) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/">
            <Button>Return to Shop</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { success, order } = await getOrderDetails(id);

  if (!success || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-500 mb-6">We couldn&apos;t find an order with that ID.</p>
          <Link href="/">
            <Button>Return to Shop</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <ClearCart />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 md:py-16">
        <div className="bg-white border border-brand-border rounded-xl p-8 md:p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-brand-black mb-2">Order Confirmed!</h1>
          <div className="inline-block px-3 py-1 bg-gray-100 text-brand-black text-xs font-bold rounded-full uppercase tracking-wider mb-4">
            Order Status: <span className="text-brand-primary font-black">{order.orderStatus}</span>
          </div>
          <p className="text-gray-600 mb-8">
            Thank you for shopping with RoadsRide. Your order <span className="font-semibold text-brand-black">{order.orderNumber}</span> has been received.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 text-left mb-8 border border-brand-border">
            <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
              <Package size={20} /> Order Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Contact Info</p>
                <p className="font-medium text-brand-black">{order.customerName}</p>
                <p className="text-sm text-gray-700">{order.email}</p>
                <p className="text-sm text-gray-700">{order.phone}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Shipping Address</p>
                <p className="text-sm text-gray-700">{order.address}</p>
                <p className="text-sm text-gray-700">{order.city}, {order.state} {order.pincode}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                <p className="font-medium text-brand-black capitalize">
                  {order.paymentMethod === 'razorpay' ? 'Online Payment' : 'Cash on Delivery'}
                </p>
                <p className={`text-xs mt-1 font-bold uppercase ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 
                  order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Status: {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' ? 'To be paid on delivery' : order.paymentStatus}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-brand-black text-lg">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-8 border border-brand-border">
            <h2 className="text-lg font-bold text-brand-black mb-4 flex items-center gap-2">
              <Package size={20} /> Items Ordered
            </h2>
            <div className="space-y-4 divide-y divide-gray-200">
              {order.items?.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                  {item.image && (
                    <div className="w-16 h-16 relative rounded border border-brand-border bg-white flex-shrink-0">
                      <Image src={item.image} alt={item.productName} fill className="object-cover rounded" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-black line-clamp-2 text-sm">{item.productName}</p>
                    {item.packName && (
                      <p className="text-xs text-gray-500 mt-0.5">Number of Items: {item.packName}</p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-brand-black">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/track-order">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Track Order
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
