'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateReviewStatus } from '@/actions/review';
import { useToast } from '@/components/ui/toast';
import { Loader2, Search, CheckCircle2, XCircle, Trash2, Star, EyeOff, Eye } from 'lucide-react';
import Image from 'next/image';

export default function ReviewsClient({ initialData, pagination }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/reviews?search=${encodeURIComponent(searchTerm)}&status=${filter}`);
  };

  const handleFilter = (status) => {
    setFilter(status);
    router.push(`/admin/reviews?search=${encodeURIComponent(searchTerm)}&status=${status}`);
  };

  const handleAction = async (id, action) => {
    if (action === 'delete' && !confirm('Are you sure you want to permanently delete this review?')) return;

    setLoading(true);
    const { success, error } = await updateReviewStatus(id, action);
    setLoading(false);

    if (success) {
      addToast({ title: 'Review updated successfully', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Update failed', message: error, type: 'error' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {['all', 'pending', 'approved'].map((f) => (
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
              <th className="px-6 py-4">Product & Customer</th>
              <th className="px-6 py-4">Review</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                  <p className="text-base mb-1">No reviews found</p>
                  <p className="text-sm">Adjust your search or filter to see more results.</p>
                </td>
              </tr>
            ) : (
              initialData.map((review) => (
                <tr key={review.id} className={`hover:bg-gray-50/50 transition-colors ${!review.approved ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden relative flex-shrink-0 bg-white">
                          {review.product?.images?.[0]?.src ? (
                            <Image src={review.product.images[0].src} alt={review.product.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1" title={review.product?.name}>
                            {review.product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-xs text-gray-500">ID: {review.id.slice(-8)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 pl-2 border-l-2 border-gray-200 flex items-center gap-2">
                        {review.customer?.avatar ? (
                          <img src={review.customer.avatar} alt="Avatar" className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-bold text-[9px]">
                            {review.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700">{review.author}</span>
                        {review.verified && <CheckCircle2 size={12} className="text-green-500" title="Verified Purchase" />}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 max-w-sm">
                    <div className="flex items-center gap-1 text-brand-yellow mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-300'} />
                      ))}
                    </div>
                    {review.title && <p className="font-semibold text-gray-900 mb-1">{review.title}</p>}
                    <p className="text-gray-600 line-clamp-2" title={review.content}>{review.content}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {review.images.map((media, idx) => {
                          const isVideo = media.match(/\.(mp4|webm|mov)(\?|$)/i);
                          return (
                            <a key={idx} href={media} target="_blank" rel="noopener noreferrer" className="block">
                              <div className="w-14 h-14 rounded-lg border border-gray-200 overflow-hidden relative group cursor-pointer hover:border-brand-yellow transition-colors">
                                {isVideo ? (
                                  <>
                                    <video src={media} className="w-full h-full object-cover" muted preload="metadata" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                      <span className="text-white text-[10px] font-bold">▶ VID</span>
                                    </div>
                                  </>
                                ) : (
                                  <Image src={media} alt="Attached" fill className="object-cover" sizes="64px" />
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {review.approved ? (
                        <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-[11px] font-semibold w-max border border-green-200">
                          <CheckCircle2 size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full text-[11px] font-semibold w-max border border-orange-200">
                          <Loader2 size={12} /> Pending Review
                        </span>
                      )}
                      
                      {review.isFeatured && (
                        <span className="inline-flex items-center gap-1 text-brand-black bg-brand-yellow/20 px-2.5 py-1 rounded-full text-[11px] font-semibold w-max border border-brand-yellow/40">
                          <Star size={12} fill="currentColor" /> Featured
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!review.approved ? (
                        <button 
                          disabled={loading}
                          onClick={() => handleAction(review.id, 'approve')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Approve"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      ) : (
                        <button 
                          disabled={loading}
                          onClick={() => handleAction(review.id, 'hide')}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Hide (Unapprove)"
                        >
                          <EyeOff size={18} />
                        </button>
                      )}

                      {review.approved && !review.isFeatured && (
                        <button 
                          disabled={loading}
                          onClick={() => handleAction(review.id, 'feature')}
                          className="p-1.5 text-brand-yellow hover:bg-brand-yellow/10 rounded transition-colors" title="Feature Review"
                        >
                          <Star size={18} />
                        </button>
                      )}

                      {review.isFeatured && (
                        <button 
                          disabled={loading}
                          onClick={() => handleAction(review.id, 'unfeature')}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors" title="Remove Feature"
                        >
                          <Eye size={18} />
                        </button>
                      )}

                      <button 
                        disabled={loading}
                        onClick={() => handleAction(review.id, 'delete')}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
              onClick={() => router.push(`/admin/reviews?page=${pagination.page - 1}&search=${encodeURIComponent(searchTerm)}&status=${filter}`)}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => router.push(`/admin/reviews?page=${pagination.page + 1}&search=${encodeURIComponent(searchTerm)}&status=${filter}`)}
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
