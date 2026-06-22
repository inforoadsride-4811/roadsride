import { Loader2 } from 'lucide-react';

export default function CheckoutLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-yellow mb-4" />
      <h2 className="text-xl font-bold text-brand-black">Preparing Checkout...</h2>
      <p className="text-gray-500 mt-2">Securely loading your cart and payment options.</p>
    </div>
  );
}
