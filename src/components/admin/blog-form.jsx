'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { createBlogPost, updateBlogPost } from '@/actions/admin-blogs';
import { uploadFile, BUCKETS } from '@/lib/storage';
import { Loader2, ImagePlus, X, ChevronLeft, Save } from 'lucide-react';
import Link from 'next/link';
import RichTextEditor from '@/components/admin/rich-text-editor';
import useAdminStore from '@/store/admin';

export default function BlogForm({ initialData = null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const setDirty = useAdminStore((state) => state.setDirty);
  const isNew = !initialData;

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    coverImage: initialData?.coverImage || '',
    status: initialData?.status || 'draft',
    author: initialData?.author || '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    seoKeywords: initialData?.seoKeywords || '',
  });

  const handleChange = (e) => {
    setDirty(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (val) => {
    setDirty(true);
    setFormData({ ...formData, content: val });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    setDirty(true);
    const { success, url, error } = await uploadFile(file, BUCKETS.BLOGS);
    if (success) {
      setFormData({ ...formData, coverImage: url });
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setUploadingImage(false);
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setDirty(true);
    setFormData({ ...formData, coverImage: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      addToast({ title: 'Missing required fields', message: 'Title and content are required.', type: 'error' });
      return;
    }

    setLoading(true);

    let result;
    if (isNew) {
      result = await createBlogPost(formData);
    } else {
      result = await updateBlogPost(initialData.id, formData);
    }

    if (result.success) {
      setDirty(false);
      addToast({ title: 'Success', message: 'Blog post saved successfully', type: 'success' });
      if (isNew) {
        router.push(`/admin/blogs/${result.blog.id}/edit`);
      } else {
        router.refresh();
      }
    } else {
      addToast({ title: 'Error', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <button type="button" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Create Blog Post' : 'Edit Blog Post'}</h1>
            <p className="text-sm text-gray-500">{formData.title || 'Untitled Post'}</p>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="bg-brand-black text-white hover:bg-gray-800 font-bold px-6 h-10">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {isNew ? 'Publish' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                placeholder="Blog post title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short Description)</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow resize-none"
                placeholder="Brief summary of the blog post..."
              />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Content *</h3>
            <div className="min-h-[400px]">
              <RichTextEditor 
                value={formData.content} 
                onChange={handleContentChange}
                placeholder="Write your blog post here..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          
          {/* Cover Image */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Cover Image</h3>
            
            {formData.coverImage ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 group">
                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-yellow hover:bg-gray-50 transition-colors cursor-pointer text-gray-400 hover:text-brand-yellow">
                  {uploadingImage ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Upload Cover</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              </div>
            )}
          </div>

          {/* SEO Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Search Engine Optimization</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow text-sm font-mono"
                placeholder="Leave blank to auto-generate"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                placeholder={formData.title || "SEO Title"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow text-sm resize-none"
                placeholder="Meta description for search engines..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
              <input
                type="text"
                name="seoKeywords"
                value={formData.seoKeywords}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow"
                placeholder="Comma separated keywords"
              />
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
