'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { bulkDeleteReviews, bulkUpdateReviewStatus } from '@/actions/admin';
import { updateReviewStatus, editReview, replyToReview } from '@/actions/review';
import { Loader2, Search, CheckCircle2, Trash2, Star, EyeOff, Eye, Pencil, MessageSquare, X, ChevronDown, XCircle } from 'lucide-react';
import Image from 'next/image';

// ─── Edit Review Modal ─────────────────────────────────────────────────────────
function EditReviewModal({ review, onClose, onSave }) {
  const [title, setTitle] = useState(review.title || '');
  const [content, setContent] = useState(review.content || '');
  const [rating, setRating] = useState(review.rating);
  const [images, setImages] = useState(review.images || (review.image ? [review.image] : []));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave(review.id, { title, content, rating, images });
    setSaving(false);
    if (result) onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Edit Review</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    fill={rating >= star ? '#F5C400' : 'none'}
                    className={rating >= star ? 'text-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow text-sm"
              placeholder="Review title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow text-sm resize-none"
              placeholder="Review content..."
            />
          </div>

          {/* GIF / Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image / GIF URL (Optional)</label>
            <input
              type="text"
              value={images?.[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                setImages(val ? [val] : []);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow text-sm"
              placeholder="https://media.giphy.com/media/.../giphy.gif"
            />
            <p className="text-xs text-gray-500 mt-1">Paste a URL to a GIF or image to embed it in the review.</p>
          </div>

          {/* Author info (read-only) */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{review.author}</span> · {new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button type="button" variant="outline" onClick={onClose} className="px-5">Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={saving} className="px-5 bg-brand-black text-white hover:bg-gray-800">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Reply Modal ────────────────────────────────────────────────────────────────
function ReplyModal({ review, onClose, onSave }) {
  const [reply, setReply] = useState(review.adminReply || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave(review.id, reply.trim());
    setSaving(false);
    if (result) onClose();
  };

  const handleRemoveReply = async () => {
    setSaving(true);
    const result = await onSave(review.id, '');
    setSaving(false);
    if (result) onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            {review.adminReply ? 'Edit Reply' : 'Reply to Review'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Original review context */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} className={i < review.rating ? '' : 'text-gray-300'} />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700">{review.author}</span>
            </div>
            {review.title && <p className="text-sm font-semibold text-gray-900 mb-1">{review.title}</p>}
            <p className="text-sm text-gray-600 line-clamp-3">{review.content}</p>
          </div>

          {/* Reply textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow text-sm resize-none"
              placeholder="Write your reply to the customer..."
            />
          </div>
        </div>

        <div className="flex justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div>
            {review.adminReply && (
              <Button type="button" variant="outline" onClick={handleRemoveReply} disabled={saving} className="px-4 text-red-600 border-red-200 hover:bg-red-50">
                Remove Reply
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="px-5">Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={saving || !reply.trim()} className="px-5 bg-brand-black text-white hover:bg-gray-800">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</> : 'Save Reply'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ReviewsClient({ initialData, pagination }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const bulkMenuRef = useRef(null);

  // Modals
  const [editingReview, setEditingReview] = useState(null);
  const [replyingReview, setReplyingReview] = useState(null);

  // Close bulk menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bulkMenuRef.current && !bulkMenuRef.current.contains(e.target)) {
        setBulkMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    setLoadingId(id);
    const { success, error } = await updateReviewStatus(id, action);
    setLoadingId(null);

    if (success) {
      addToast({ title: `Review ${action === 'approve' ? 'approved' : action === 'hide' ? 'hidden' : action === 'delete' ? 'deleted' : 'updated'} successfully`, type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Update failed', message: error, type: 'error' });
    }
  };

  const handleEditSave = async (id, data) => {
    const { success, error } = await editReview(id, data);
    if (success) {
      addToast({ title: 'Review updated successfully', type: 'success' });
      router.refresh();
      return true;
    } else {
      addToast({ title: 'Edit failed', message: error, type: 'error' });
      return false;
    }
  };

  const handleReplySave = async (id, reply) => {
    const { success, error } = await replyToReview(id, reply);
    if (success) {
      addToast({ title: reply ? 'Reply saved successfully' : 'Reply removed', type: 'success' });
      router.refresh();
      return true;
    } else {
      addToast({ title: 'Reply failed', message: error, type: 'error' });
      return false;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(initialData.map(r => r.id));
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

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    setBulkMenuOpen(false);

    const labels = { approve: 'approve', reject: 'reject', delete: 'delete' };
    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedIds.length} review(s)? This cannot be undone.`)) return;
    if (action === 'reject' && !confirm(`Reject ${selectedIds.length} review(s)? They will be hidden from the storefront.`)) return;

    setIsBulkProcessing(true);
    try {
      let result;
      if (action === 'delete') {
        result = await bulkDeleteReviews(selectedIds);
      } else {
        result = await bulkUpdateReviewStatus(selectedIds, action);
      }

      if (result.success) {
        const pastTense = { approve: 'approved', reject: 'rejected', delete: 'deleted' };
        addToast({ title: 'Success', message: `${selectedIds.length} review(s) ${pastTense[action]}`, type: 'success' });
        setSelectedIds([]);
        router.refresh();
      } else {
        addToast({ title: 'Error', message: result.error || 'Operation failed', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <div className="relative" ref={bulkMenuRef}>
                <button
                  type="button"
                  onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
                  disabled={isBulkProcessing}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isBulkProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>Actions ({selectedIds.length}) <ChevronDown size={14} className={`transition-transform ${bulkMenuOpen ? 'rotate-180' : ''}`} /></>
                  )}
                </button>

                {bulkMenuOpen && (
                  <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-1">
                      <button onClick={() => handleBulkAction('approve')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors">
                        <CheckCircle2 size={16} className="text-green-500" /> Approve Selected
                      </button>
                      <button onClick={() => handleBulkAction('reject')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors">
                        <XCircle size={16} className="text-orange-500" /> Reject Selected
                      </button>
                      <div className="my-1 border-t border-gray-100" />
                      <button onClick={() => handleBulkAction('delete')} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} /> Delete Selected
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
          </div>

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
                <th className="px-6 py-4 w-[50px] text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={initialData.length > 0 && selectedIds.length === initialData.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Product & Customer</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-base mb-1">No reviews found</p>
                    <p className="text-sm">Adjust your search or filter to see more results.</p>
                  </td>
                </tr>
              ) : (
                initialData.map((review) => (
                  <tr key={review.id} className={`transition-colors ${!review.approved ? 'bg-orange-50/30' : ''} ${selectedIds.includes(review.id) ? 'bg-blue-50/50 hover:bg-blue-50/60' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedIds.includes(review.id)}
                        onChange={(e) => handleSelectOne(e, review.id)}
                      />
                    </td>
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

                      {/* Show admin reply if exists */}
                      {review.adminReply && (
                        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                          <p className="text-[10px] font-semibold text-blue-600 mb-0.5">Admin Reply</p>
                          <p className="text-xs text-blue-800 line-clamp-2">{review.adminReply}</p>
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

                        {review.adminReply && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-[11px] font-semibold w-max border border-blue-200">
                            <MessageSquare size={12} /> Replied
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Approve / Hide */}
                        {!review.approved ? (
                          <button 
                            disabled={loadingId === review.id}
                            onClick={() => handleAction(review.id, 'approve')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve"
                          >
                            {loadingId === review.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          </button>
                        ) : (
                          <button 
                            disabled={loadingId === review.id}
                            onClick={() => handleAction(review.id, 'hide')}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Hide (Unapprove)"
                          >
                            <EyeOff size={16} />
                          </button>
                        )}

                        {/* Edit */}
                        <button 
                          onClick={() => setEditingReview(review)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Review"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Reply */}
                        <button 
                          onClick={() => setReplyingReview(review)}
                          className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors" title="Reply to Review"
                        >
                          <MessageSquare size={16} />
                        </button>

                        {/* Feature / Unfeature */}
                        {review.approved && !review.isFeatured && (
                          <button 
                            disabled={loadingId === review.id}
                            onClick={() => handleAction(review.id, 'feature')}
                            className="p-2 text-brand-yellow hover:bg-brand-yellow/10 rounded-lg transition-colors" title="Feature Review"
                          >
                            <Star size={16} />
                          </button>
                        )}

                        {review.isFeatured && (
                          <button 
                            disabled={loadingId === review.id}
                            onClick={() => handleAction(review.id, 'unfeature')}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Remove Feature"
                          >
                            <Eye size={16} />
                          </button>
                        )}

                        {/* Delete */}
                        <button 
                          disabled={loadingId === review.id}
                          onClick={() => handleAction(review.id, 'delete')}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Edit Modal */}
      {editingReview && (
        <EditReviewModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Reply Modal */}
      {replyingReview && (
        <ReplyModal
          review={replyingReview}
          onClose={() => setReplyingReview(null)}
          onSave={handleReplySave}
        />
      )}
    </>
  );
}
