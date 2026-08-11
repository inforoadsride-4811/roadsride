'use client';

import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { submitBlogComment, getApprovedBlogComments } from '@/actions/blog-comments';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessageSquare, Star, User, ImagePlus, Camera, Film, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAX_FILES = 5;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;  // 15MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export default function BlogCommentsSection({ blogId, initialComments = [] }) {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const { data: commentsData } = useQuery({
    queryKey: ['blogComments', blogId],
    queryFn: async () => {
      const res = await getApprovedBlogComments(blogId);
      if (res.success) return res.comments;
      return [];
    },
    initialData: initialComments,
  });

  const comments = commentsData || initialComments;
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach(m => {
        if (m.preview) URL.revokeObjectURL(m.preview);
      });
    };
  }, []);

  const compressImage = (file, maxWidth = 1500, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
              height = (maxWidth * height) / width;
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Canvas is empty'));
                  return;
                }
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(newFile);
              },
              'image/jpeg',
              quality
            );
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e) => {
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
      const maxLabel = isVideo ? '20MB' : '15MB';
      if (file.size > maxSize) {
        addToast({ title: `${file.name} exceeds ${maxLabel} limit`, type: 'error' });
        return false;
      }
      return true;
    });

    const processedFiles = await Promise.all(validFiles.map(async (file) => {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      if (isImage && file.type !== 'image/gif') {
        try {
          return await compressImage(file);
        } catch (err) {
          return file;
        }
      }
      return file;
    }));

    const newMedia = processedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: ALLOWED_VIDEO_TYPES.includes(file.type) ? 'video' : 'image',
    }));

    setMediaFiles(prev => [...prev, ...newMedia]);
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
    if (!author.trim() || !content.trim()) {
      addToast({ title: 'Missing fields', message: 'Please enter your name and comment.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    let uploadedUrls = [];
    if (mediaFiles.length > 0) {
      setUploading(true);
      const uploadPromises = mediaFiles.map(m =>
        uploadFile(m.file, BUCKETS.REVIEWS, `blog-${blogId}/`)
      );
      const results = await Promise.all(uploadPromises);
      setUploading(false);

      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        addToast({ title: `${failed.length} file(s) failed to upload`, type: 'error' });
      }
      uploadedUrls = results.filter(r => r.success).map(r => r.url);
    }

    const result = await submitBlogComment(blogId, { author, content, rating, images: uploadedUrls });
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setAuthor('');
      setContent('');
      setRating(0);
      setMediaFiles([]);
      addToast({ title: 'Success', message: result.message, type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['blogComments', blogId] });
    } else {
      addToast({ title: 'Error', message: result.error, type: 'error' });
    }
  };

  return (
    <div className="mt-16 pt-10 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-8">
        <MessageSquare className="w-6 h-6 text-brand-yellow" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-10 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a Reply</h3>
        {isSuccess ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <p className="font-medium">Thank you for your comment!</p>
            <p className="text-sm mt-1">Your comment has been submitted and is pending review by our team.</p>
            <Button variant="outline" className="mt-4 bg-white" onClick={() => setIsSuccess(false)}>
              Write another comment
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating (Optional)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      fill={rating >= star ? '#F5C400' : 'none'}
                      className={rating >= star ? 'text-brand-yellow' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Comment *</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white resize-none transition-all"
                placeholder="Share your thoughts..."
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-yellow flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-yellow transition-colors cursor-pointer bg-white"
                    >
                      <ImagePlus size={20} />
                      <span className="text-[9px] font-medium text-center leading-tight">Gallery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-brand-yellow flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-yellow transition-colors cursor-pointer bg-white"
                    >
                      <Camera size={20} />
                      <span className="text-[9px] font-medium text-center leading-tight">Camera</span>
                    </button>
                  </div>
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
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-[11px] text-gray-400 mt-2">Photos: Auto-compressed · Videos: MP4, WebM (max 20MB)</p>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting} className="bg-brand-black text-white hover:bg-gray-800 px-8 py-3 h-auto rounded-xl font-bold disabled:opacity-50">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> {uploading ? 'Uploading media...' : 'Submitting...'}
                  </span>
                ) : 'Post Comment'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {comment.customer?.avatar ? (
                    <img src={comment.customer.avatar} alt={comment.author} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{comment.author}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {comment.rating ? (
                      <div className="flex gap-0.5 text-brand-yellow">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < comment.rating ? 'currentColor' : 'none'} className={i < comment.rating ? '' : 'text-gray-300'} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-3">{comment.content}</p>

                  {/* Display Media */}
                  {comment.images && comment.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {comment.images.map((media, idx) => {
                        const isVideo = media.match(/\.(mp4|webm|mov)(\?|$)/i);
                        return (
                          <a key={idx} href={media} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-gray-200 overflow-hidden relative group cursor-pointer hover:border-brand-yellow transition-colors">
                              {isVideo ? (
                                <>
                                  <video src={media} className="w-full h-full object-cover" muted preload="metadata" />
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <Film className="text-white w-6 h-6" />
                                  </div>
                                </>
                              ) : (
                                <img src={media} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Admin Reply */}
                  {comment.adminReply && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-brand-black flex items-center justify-center">
                          <img src="/logo.png" alt="RoadsRide" className="w-4 h-4 object-contain brightness-0 invert" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <span className="font-bold text-sm text-gray-900">RoadsRide Team</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-8">{comment.adminReply}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
