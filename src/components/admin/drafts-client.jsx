'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, ShoppingCart, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { bulkDeleteDrafts, deleteDraft } from '@/actions/drafts';
import { formatPrice } from '@/lib/product';
import DraftDetailModal from '@/components/admin/draft-detail-modal';

export default function DraftsClient({ initialData, pagination }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/drafts?search=${encodeURIComponent(searchTerm)}&status=${filter}`);
  };

  const handleFilter = (status) => {
    setFilter(status);
    router.push(`/admin/drafts?search=${encodeURIComponent(searchTerm)}&status=${status}`);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(initialData.map(d => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    e.stopPropagation();
    if (e.target.checked) {
      if (selectedIds.length >= 10) {
        addToast({ title: 'Limit Reached', message: 'Maximum 10 records can be selected at once', type: 'error' });
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} drafts? This cannot be undone.`)) return;

    setIsDeletingBulk(true);
    try {
      const result = await bulkDeleteDrafts(selectedIds);
      if (result.success) {
        addToast({ title: 'Success', message: `Successfully deleted ${selectedIds.length} drafts`, type: 'success' });
        setSelectedIds([]);
        router.refresh();
      } else {
        addToast({ title: 'Error', message: result.error || 'Failed to delete drafts', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    setDeletingId(id);
    const result = await deleteDraft(id);
    if (result.success) {
      addToast({ title: 'Success', message: 'Draft deleted', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Error', message: result.error || 'Failed to delete draft', type: 'error' });
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
            >
              {isDeletingBulk ? 'Deleting...' : <Trash2 className="w-4 h-4 mr-2" />}
              {isDeletingBulk ? '' : `Delete Selected (${selectedIds.length})`}
            </Button>
          )}
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search email, phone, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white"
            />
          </form>
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'draft', 'completed'].map((f) => (
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
              <th className="px-6 py-4 w-[50px] text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={initialData.length > 0 && selectedIds.length === initialData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Cart Summary</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Value</th>
              <th className="px-6 py-4 text-right">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <ShoppingCart size={40} className="text-gray-300 mb-3" />
                    <p className="text-base mb-1">No drafts found</p>
                    <p className="text-sm">When users abandon their checkout, it will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              initialData.map((draft) => (
                <tr key={draft.id} className={`transition-colors ${selectedIds.includes(draft.id) ? 'bg-blue-50/50 hover:bg-blue-50/60' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(draft.id)}
                      onChange={(e) => handleSelectOne(e, draft.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900">{[draft.firstName, draft.lastName].filter(Boolean).join(' ') || 'Unknown'}</p>
                      {draft.email && <p className="text-xs text-gray-500">{draft.email}</p>}
                      {draft.phone && <p className="text-xs text-gray-500">{draft.phone}</p>}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      {Array.isArray(draft.cartItems) ? (
                        <>
                          {draft.cartItems.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {item.image && <img src={item.image} alt="" className="w-6 h-6 rounded object-cover border border-gray-200" />}
                              <span className="truncate">{item.quantity}x {item.productName}</span>
                            </div>
                          ))}
                          {draft.cartItems.length > 2 && (
                            <span className="text-xs text-gray-400">+{draft.cartItems.length - 2} more items</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">Invalid cart data</span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {draft.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-semibold border border-green-200">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    ) : draft.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-semibold border border-blue-200">
                        <Clock size={12} /> Pending
                      </span>
                    ) : draft.status === 'contacted' ? (
                      <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs font-semibold border border-purple-200">
                        <Clock size={12} /> Contacted
                      </span>
                    ) : draft.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold border border-red-200">
                        <Clock size={12} /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded text-xs font-semibold border border-orange-200">
                        <Clock size={12} /> Draft
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatPrice(draft.total)}
                  </td>

                  <td className="px-6 py-4 text-right text-gray-500">
                    {new Date(draft.updatedAt).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDraft(draft)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(draft.id)}
                      disabled={deletingId === draft.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 h-auto"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Showing Page <span className="font-semibold text-gray-900">{pagination.page}</span> of <span className="font-semibold text-gray-900">{pagination.pages}</span>
          </p>
          <div className="flex gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => router.push(`/admin/drafts?page=${pagination.page - 1}&search=${encodeURIComponent(searchTerm)}&status=${filter}`)}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => router.push(`/admin/drafts?page=${pagination.page + 1}&search=${encodeURIComponent(searchTerm)}&status=${filter}`)}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <DraftDetailModal 
        draft={selectedDraft}
        open={!!selectedDraft}
        onClose={() => setSelectedDraft(null)}
      />
    </div>
  );
}
