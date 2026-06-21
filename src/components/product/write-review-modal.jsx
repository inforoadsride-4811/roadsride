'use client';

import { useState, useEffect, useRef } from 'react';
import { submitReview } from '@/actions/review';
import { getSessionCustomer } from '@/actions/customer-auth';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { useToast } from '@/components/ui/toast';
import { X, Star, Loader2, ImagePlus, Film, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MAX_FILES = 5;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;  // 2MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export default function WriteReviewModal({ productId, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // { file, preview, type: 'image'|'video' }
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function checkAuth() {
      const { success, customer } = await getSessionCustomer();
      if (success && customer) {
        setCustomer(customer);
      }
      setLoadingAuth(false);
    }
    checkAuth();
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach(m => {
        if (m.preview) URL.revokeObjectURL(m.preview);
      });
    };
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_FILES - mediaFiles.length;

    if (files.length > remaining) {
      addToast({ title: `Max ${MAX_FILES} files allowed`, type: 'error' });
    }

    const validFiles = files.slice(0, remaining).filter(file => {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
      if (!isImage && !isVideo) {
        addToast({ title: `${file.name} is not a supported format`, type: 'error' });
        return false;
      }
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const maxLabel = isVideo ? '20MB' : '2MB';
      if (file.size > maxSize) {
        addToast({ title: `${file.name} exceeds ${maxLabel} limit`, type: 'error' });
        return false;
      }
      return true;
    });

    const newMedia = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: ALLOWED_VIDEO_TYPES.includes(file.type) ? 'video' : 'image',
    }));

    setMediaFiles(prev => [...prev, ...newMedia]);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      addToast({ title: 'Please select a rating', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Upload media files to Supabase Storage
      let uploadedUrls = [];
      if (mediaFiles.length > 0) {
        setUploading(true);
        const uploadPromises = mediaFiles.map(m => 
          uploadFile(m.file, BUCKETS.REVIEWS, `${productId}/`)
        );
        const results = await Promise.all(uploadPromises);
        setUploading(false);

        const failed = results.filter(r => !r.success);
        if (failed.length > 0) {
          addToast({ title: `${failed.length} file(s) failed to upload`, type: 'error' });
        }
        uploadedUrls = results.filter(r => r.success).map(r => r.url);
      }

      const { success, error } = await submitReview({
        productId,
        rating,
        title,
        content,
        images: uploadedUrls,
      });

      if (success) {
        addToast({ title: 'Review submitted!', message: 'Thank you for your feedback. It will appear once approved.', type: 'success' });
        onSuccess?.();
      } else {
        addToast({ title: 'Submission failed', message: error, type: 'error' });
      }
    } catch (err) {
      addToast({ title: 'Error', message: 'Something went wrong', type: 'error' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col"
        style={{ transformOrigin: 'center' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h3>
          <p className="text-gray-500 text-sm mb-6">Share your thoughts and experience with this product.</p>

          {loadingAuth ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
            </div>
          ) : !customer ? (
            <div className="text-center py-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-4 border border-gray-100">
                <p className="text-gray-700 mb-4">Please login to write a review.</p>
                <Link href="/account/login">
                  <Button className="w-full bg-brand-black text-white hover:bg-gray-800">
                    Login to Review
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                {customer.avatar ? (
                  <img src={customer.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-black font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">Posting publicly as this user</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={28} 
                        fill={(hoverRating || rating) >= star ? '#F5C400' : 'none'} 
                        className={(hoverRating || rating) >= star ? 'text-brand-yellow' : 'text-gray-300'} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Review</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="What did you like or dislike? How did you use the product?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Media Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos & Videos <span className="text-gray-400 font-normal">({mediaFiles.length}/{MAX_FILES})</span>
                </label>

                <div className="flex flex-wrap gap-3">
                  {/* Preview thumbnails */}
                  {mediaFiles.map((media, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-200 group">
                      {media.type === 'video' ? (
                        <video src={media.preview} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={media.preview} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                      {/* Type badge */}
                      {media.type === 'video' && (
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <Film size={8} /> Video
                        </div>
                      )}
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Add button */}
                  {mediaFiles.length < MAX_FILES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-yellow flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-yellow transition-colors cursor-pointer"
                    >
                      <ImagePlus size={20} />
                      <span className="text-[9px] font-medium">Add</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-[11px] text-gray-400 mt-2">Photos: JPG, PNG, WebP (max 2MB) · Videos: MP4, WebM (max 20MB)</p>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || rating === 0}
                  className="w-full py-3 bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-bold text-base rounded-xl disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> {uploading ? 'Uploading media...' : 'Submitting...'}
                    </span>
                  ) : 'Submit Review'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
