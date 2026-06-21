import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import CartPageContent from '@/components/cart/cart-page-content';

export const metadata = {
  title: 'Shopping Cart | RoadsRide',
  description: 'View and manage your shopping cart',
};

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <CartPageContent />
      </main>
    </div>
  );
}
