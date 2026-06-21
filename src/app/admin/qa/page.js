import { getAdminQAs } from '@/actions/qa';
import { getProducts } from '@/actions/product';
import QAClient from '@/components/admin/qa-client';
import { Suspense } from 'react';

export const metadata = {
  title: 'Manage Q&A | Admin',
};

export default async function AdminQAPage() {
  const [qaRes, productsRes] = await Promise.all([
    getAdminQAs(),
    getProducts({ limit: 100 }) // Get products for the "Add Dummy Q&A" dropdown
  ]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Q&A</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer questions and answers</p>
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse bg-white rounded-xl h-64 border border-gray-200"></div>}>
        <QAClient 
          initialQAs={qaRes.success ? qaRes.qas : []} 
          products={productsRes.success ? productsRes.products : []}
        />
      </Suspense>
    </div>
  );
}
