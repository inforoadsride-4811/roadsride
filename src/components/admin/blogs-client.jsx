'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { deleteBlogPost, updateBlogPost, bulkDeleteBlogs, bulkUpdateBlogStatus } from '@/actions/admin-blogs';
import { Loader2, Search, Plus, Trash2, Edit, ExternalLink, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function BlogsClient({ initialData, pagination }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/admin/blogs?search=${encodeURIComponent(searchTerm)}&status=${filter === 'all' ? '' : filter}`);
  };

  const handleFilter = (status) => {
    setFilter(status);
    router.push(`/admin/blogs?search=${encodeURIComponent(searchTerm)}&status=${status === 'all' ? '' : status}`);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    setLoadingId(id);
    const { success, error } = await deleteBlogPost(id);
    setLoadingId(null);

    if (success) {
      addToast({ title: 'Blog deleted successfully', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Delete failed', message: error, type: 'error' });
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setLoadingId(id);
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const { success, error } = await updateBlogPost(id, { status: newStatus });
    setLoadingId(null);

    if (success) {
      addToast({ title: `Status changed to ${newStatus}`, type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Status update failed', message: error, type: 'error' });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(initialData.map(b => b.id));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} blogs? This cannot be undone.`)) return;

    setBulkActionLoading('delete');
    const { success, error } = await bulkDeleteBlogs(selectedIds);
    setBulkActionLoading(null);

    if (success) {
      addToast({ title: `Deleted ${selectedIds.length} blogs`, type: 'success' });
      setSelectedIds([]);
      router.refresh();
    } else {
      addToast({ title: 'Delete failed', message: error, type: 'error' });
    }
  };

  const handleBulkStatusChange = async (status) => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(status);
    const { success, error } = await bulkUpdateBlogStatus(selectedIds, status);
    setBulkActionLoading(null);

    if (success) {
      addToast({ title: `Marked ${selectedIds.length} blogs as ${status}`, type: 'success' });
      setSelectedIds([]);
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
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white"
          />
        </form>

        <div className="flex gap-2 w-full sm:w-auto items-center justify-between sm:justify-end flex-wrap">
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 mr-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-gray-700 bg-white"
                onClick={() => handleBulkStatusChange('draft')}
                disabled={!!bulkActionLoading}
              >
                {bulkActionLoading === 'draft' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                Mark Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-green-700 bg-green-50 border-green-200 hover:bg-green-100"
                onClick={() => handleBulkStatusChange('published')}
                disabled={!!bulkActionLoading}
              >
                {bulkActionLoading === 'published' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                Mark Published
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="h-9 px-3"
                onClick={handleBulkDelete}
                disabled={!!bulkActionLoading}
              >
                {bulkActionLoading === 'delete' ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Trash2 size={14} className="mr-1.5" />}
                Delete ({selectedIds.length})
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                {['all', 'published', 'draft'].map((f) => (
                  <button
                    key={f}
                    onClick={() => handleFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filter === f 
                        ? 'bg-brand-black text-white' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <Link href="/admin/blogs/new">
                <Button className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-bold flex items-center gap-2 h-9 px-4">
                  <Plus size={16} /> New Blog
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-100 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={initialData.length > 0 && selectedIds.length === initialData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-4">Blog Post</th>
              <th className="px-6 py-4">Author</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {initialData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <p className="text-base mb-1">No blog posts found</p>
                  <p className="text-sm mb-4">Get started by creating your first blog post.</p>
                  <Link href="/admin/blogs/new">
                    <Button variant="outline">Create Blog Post</Button>
                  </Link>
                </td>
              </tr>
            ) : (
              initialData.map((blog) => (
                <tr key={blog.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(blog.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(blog.id)}
                      onChange={(e) => handleSelectOne(e, blog.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden relative flex-shrink-0 bg-gray-50 flex items-center justify-center">
                        {blog.coverImage ? (
                          <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" sizes="48px" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-brand-yellow transition-colors">
                          <Link href={`/admin/blogs/${blog.id}/edit`}>{blog.title}</Link>
                        </p>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm truncate">{blog.excerpt || 'No excerpt'}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">{blog.author || 'Admin'}</span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(blog.id, blog.status)}
                      disabled={loadingId === blog.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold w-max border transition-colors ${
                        blog.status === 'published' 
                          ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100' 
                          : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {loadingId === blog.id && <Loader2 size={12} className="animate-spin" />}
                      <span className={`w-1.5 h-1.5 rounded-full ${blog.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-gray-600">{new Date(blog.createdAt).toLocaleDateString()}</p>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {blog.status === 'published' && (
                        <a 
                          href={`/blog/${blog.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View on site"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      
                      <Link href={`/admin/blogs/${blog.id}/edit`}>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit size={16} />
                        </button>
                      </Link>

                      <button 
                        disabled={loadingId === blog.id}
                        onClick={() => handleDelete(blog.id, blog.title)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete"
                      >
                        {loadingId === blog.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
              onClick={() => router.push(`/admin/blogs?page=${pagination.page - 1}&search=${encodeURIComponent(searchTerm)}&status=${filter === 'all' ? '' : filter}`)}
              className="px-3 py-1.5 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
            >
              Prev
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => router.push(`/admin/blogs?page=${pagination.page + 1}&search=${encodeURIComponent(searchTerm)}&status=${filter === 'all' ? '' : filter}`)}
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
