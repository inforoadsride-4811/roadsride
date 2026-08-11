'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { createCategory, updateCategory, deleteCategory } from '@/actions/admin-products';
import { bulkDeleteCategories } from '@/actions/admin';
import { uploadFile, deleteFile, BUCKETS } from '@/lib/storage';

const COMMON_ICONS = [
  'Car', 'Wrench', 'Settings', 'Zap', 'Shield', 'Star', 'PenTool', 'Wind', 
  'Sun', 'Droplet', 'Battery', 'Radio', 'Key', 'Lock', 'MapPin', 'Truck', 
  'Bike', 'Box', 'Package', 'ShoppingBag', 'Tag', 'Sparkles', 'Activity', 
  'Layers', 'Umbrella', 'Speaker', 'Monitor', 'Headphones', 'Video', 'Camera'
];

export default function CategoriesClient({ initialCategories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true,
  });

  const flattenTree = (categories, parentId = null, depth = 0) => {
    let result = [];
    const children = categories.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    for (const child of children) {
      result.push({ ...child, depth });
      result = result.concat(flattenTree(categories, child.id, depth + 1));
    }
    return result;
  };

  const displayedCategories = flattenTree(initialCategories).filter(c => 
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    router.push(`/admin/categories?${params.toString()}`);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', image: '', parentId: '', isActive: true });
    setIconSearchQuery('');
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: category.image || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
    });
    setIconSearchQuery('');
    setIsModalOpen(true);
  };

  const displayedIcons = iconSearchQuery 
    ? Object.keys(LucideIcons).filter(k => /^[A-Z]/.test(k) && k.toLowerCase().includes(iconSearchQuery.toLowerCase())).slice(0, 100)
    : COMMON_ICONS;

  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!editingCategory || formData.slug === editingCategory.slug) {
      setFormData({ ...formData, name: val, slug: autoSlug });
    } else {
      setFormData({ ...formData, name: val });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { success, url, error } = await uploadFile(file, BUCKETS.CATEGORIES);
    if (success) {
      if (formData.image) await deleteFile(formData.image, BUCKETS.CATEGORIES);
      setFormData({ ...formData, image: url });
      addToast({ title: 'Image uploaded', type: 'success' });
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setUploadingImage(false);
  };

  const handleRemoveImage = async () => {
    if (formData.image) {
      await deleteFile(formData.image, BUCKETS.CATEGORIES);
      setFormData({ ...formData, image: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let res;
    if (editingCategory) {
      res = await updateCategory(editingCategory.id, formData);
    } else {
      res = await createCategory(formData);
    }

    if (res.success) {
      addToast({ title: 'Success', message: `Category ${editingCategory ? 'updated' : 'created'}.`, type: 'success' });
      setIsModalOpen(false);
      router.refresh();
    } else {
      addToast({ title: 'Error', message: res.error, type: 'error' });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category will become uncategorized.')) return;
    
    const res = await deleteCategory(id);
    if (res.success) {
      addToast({ title: 'Deleted', message: 'Category removed successfully.', type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Error', message: res.error, type: 'error' });
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(displayedCategories.map(c => c.id));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} categories? Products in these categories will become uncategorized. This cannot be undone.`)) return;

    setIsDeletingBulk(true);
    try {
      const result = await bulkDeleteCategories(selectedIds);
      if (result.success) {
        addToast({ title: 'Success', message: `Successfully deleted ${selectedIds.length} categories`, type: 'success' });
        setSelectedIds([]);
        router.refresh();
      } else {
        addToast({ title: 'Error', message: result.error || 'Failed to delete categories', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-brand-border">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
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
          <form onSubmit={handleSearch} className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-full"
            />
          </form>
        </div>
        <Button onClick={openCreateModal} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-semibold shrink-0">
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-brand-border">
              <tr>
                <th className="px-6 py-4 w-[50px] text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={displayedCategories.length > 0 && selectedIds.length === displayedCategories.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Products Count</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {displayedCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                displayedCategories.map((cat) => (
                  <tr key={cat.id} className={`transition-colors ${selectedIds.includes(cat.id) ? 'bg-blue-50/50 hover:bg-blue-50/60' : 'hover:bg-gray-50/50'}`}>
                    <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        checked={selectedIds.includes(cat.id)}
                        onChange={(e) => handleSelectOne(e, cat.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-black flex items-center gap-3" style={{ paddingLeft: `${(cat.depth * 2) + 1.5}rem` }}>
                      {cat.image ? (
                        cat.image.startsWith('lucide:') ? (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-700">
                            {(() => {
                              const Icon = LucideIcons[cat.image.replace('lucide:', '')] || LucideIcons.HelpCircle;
                              return <Icon size={16} />;
                            })()}
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.image} alt={cat.name} className="w-8 h-8 rounded object-cover" />
                        )
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon size={14} />
                        </div>
                      )}
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                    <td className="px-6 py-4 text-gray-500">{cat._count?.products || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {cat.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(cat)} className="h-8 w-8 p-0">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination removed */}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brand-border">
              <h2 className="text-xl font-bold text-brand-black">{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <Input value={formData.name} onChange={handleNameChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select 
                  value={formData.parentId} 
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow outline-none text-sm text-gray-900 bg-white"
                >
                  <option value="">None (Top Level)</option>
                  {initialCategories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none h-24 text-gray-900 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image or Icon</label>
                
                <div className="flex gap-4 mb-4">
                  <Button type="button" variant={formData.image?.startsWith('lucide:') ? 'outline' : 'secondary'} onClick={() => setFormData({...formData, image: ''})} className="flex-1">
                    Use Image
                  </Button>
                  <Button type="button" variant={formData.image?.startsWith('lucide:') ? 'secondary' : 'outline'} onClick={() => setFormData({...formData, image: 'lucide:Car'})} className="flex-1">
                    Use Icon
                  </Button>
                </div>

                {formData.image?.startsWith('lucide:') ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input 
                          placeholder="Search hundreds of icons (e.g. 'car', 'star', 'user')..." 
                          value={iconSearchQuery}
                          onChange={(e) => setIconSearchQuery(e.target.value)}
                          className="pl-9 h-9"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 h-40 overflow-y-auto p-2">
                      {displayedIcons.map(iconName => {
                        const IconComponent = LucideIcons[iconName];
                        if (!IconComponent) return null;
                        const isSelected = formData.image === `lucide:${iconName}`;
                        return (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({ ...formData, image: `lucide:${iconName}` })}
                            className={`p-2 flex items-center justify-center rounded border hover:bg-brand-yellow/20 hover:border-brand-yellow transition-colors ${isSelected ? 'bg-brand-yellow/20 border-brand-yellow text-brand-black' : 'bg-white border-gray-200 text-gray-500'}`}
                            title={iconName}
                          >
                            <IconComponent size={20} />
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <span>Selected Icon:</span>
                      <strong className="text-brand-black">{formData.image.replace('lucide:', '')}</strong>
                    </div>
                  </div>
                ) : (
                  <>
                    {formData.image ? (
                      <div className="relative w-24 h-24 border border-brand-border rounded-lg overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={handleRemoveImage} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" className="relative w-full overflow-hidden cursor-pointer">
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon size={16} className="mr-2" />}
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                  className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded" 
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Category is Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-brand-border mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
