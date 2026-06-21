import { getCustomerById } from '@/actions/customer';
import CustomerProfileClient from '@/components/admin/customer-profile-client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }) {
  return {
    title: `Customer Profile | Admin`,
  };
}

export default async function AdminCustomerProfilePage({ params }) {
  const { id } = await params;
  
  const { success, customer, error } = await getCustomerById(id);

  if (!success || !customer) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Not Found</h2>
          <p className="text-gray-500 mb-6">{error || 'The requested customer profile could not be found.'}</p>
          <Link href="/admin/customers" className="text-brand-black underline font-medium">
            &larr; Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-black transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
            <p className="text-gray-500 mt-1">Detailed analytics, device tracking, and order history.</p>
          </div>
        </div>
      </div>
      
      <CustomerProfileClient customer={customer} />
    </div>
  );
}
