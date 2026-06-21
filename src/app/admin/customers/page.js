import { getCustomers } from '@/actions/customer';
import CustomersClient from '@/components/admin/customers-client';

export const metadata = {
  title: 'Customers | Admin',
};

export default async function AdminCustomersPage({ searchParams }) {
  const { page = '1', search = '', status = 'all' } = await searchParams;

  const response = await getCustomers({
    page: parseInt(page, 10),
    limit: 20,
    search,
    status
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage customer profiles and order history.</p>
        </div>
      </div>
      
      <CustomersClient 
        initialData={response.success ? response.customers : []} 
        pagination={response.pagination} 
      />
    </div>
  );
}
