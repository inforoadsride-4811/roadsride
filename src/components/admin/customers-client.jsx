'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Users, AlertCircle, Ban } from 'lucide-react';
import Link from 'next/link';

export default function CustomersClient({ initialData, pagination }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/customers?search=${encodeURIComponent(searchTerm)}&status=${filter}`);
  };

  const handleFilter = (status) => {
    setFilter(status);
    router.push(`/admin/customers?search=${encodeURIComponent(searchTerm)}&status=${status}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'active', 'suspended', 'banned'].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-brand-black text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Orders</th>
              <th className="px-6 py-4 text-right">Total Spend</th>
              <th className="px-6 py-4 text-right">Registered</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <p className="text-base mb-1">No customers found</p>
                  <p className="text-sm">Adjust your search or filter to see more results.</p>
                </td>
              </tr>
            ) : (
              initialData.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {customer.avatar ? (
                        <img src={customer.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand-yellow/20 flex items-center justify-center text-brand-yellow-dark font-bold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                        {customer.phone && <p className="text-xs text-gray-400">{customer.phone}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {customer.status === 'active' && <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-semibold border border-green-200">Active</span>}
                    {customer.status === 'suspended' && <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded text-xs font-semibold border border-orange-200"><AlertCircle size={12} /> Suspended</span>}
                    {customer.status === 'banned' && <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200"><Ban size={12} /> Banned</span>}
                  </td>

                  <td className="px-6 py-4 text-center font-medium text-gray-700">
                    {customer.totalOrders}
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    ₹{customer.totalSpend.toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-right text-gray-500">
                    {new Date(customer.registrationDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/admin/customers/${customer.id}`}
                      className="inline-flex items-center gap-2 p-2 text-brand-black hover:bg-gray-100 rounded transition-colors"
                      title="View Profile"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Showing Page <span className="font-semibold text-gray-900">{pagination.page}</span> of <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
          </p>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => router.push(`/admin/customers?page=${pagination.page - 1}&search=${encodeURIComponent(searchTerm)}&status=${filter}`)}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => router.push(`/admin/customers?page=${pagination.page + 1}&search=${encodeURIComponent(searchTerm)}&status=${filter}`)}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
