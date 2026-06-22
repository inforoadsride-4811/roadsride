import { Loader2 } from 'lucide-react';

export default function OrderSuccessLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 md:p-12 text-center shadow-sm w-full max-w-3xl flex flex-col items-center justify-center min-h-[400px] animate-pulse">
          <Loader2 size={48} className="animate-spin text-brand-yellow mb-6" />
          <h1 className="text-2xl font-bold text-gray-300 mb-4 bg-gray-200 h-8 w-64 rounded"></h1>
          <div className="bg-gray-100 h-4 w-48 rounded mb-8"></div>
          <div className="w-full bg-gray-50 rounded-lg p-6 border border-gray-200 h-48 mb-8"></div>
        </div>
      </main>
    </div>
  );
}
