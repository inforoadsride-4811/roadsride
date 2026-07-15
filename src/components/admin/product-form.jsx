'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Copy, Eye, Loader2, Trash2, Plus, GripVertical, HelpCircle, ChevronLeft, ChevronRight, Star, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { createProduct, updateProduct, deleteProduct, saveProductVariants, saveProductFeatures, saveProductSpecs, saveProductImages, deleteProductVariant } from '@/actions/admin-products';
import { saveProductOffers } from '@/actions/admin-offers';
import { uploadFile, deleteFile, BUCKETS } from '@/lib/storage';
import RichTextEditor from './rich-text-editor';
import useAdminStore from '@/store/admin';
import { ProductFaqModal } from './product-faq-modal';

const isVideo = (src) => src?.match(/\.(mp4|webm|mov)$/i);

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'seo', label: 'SEO' },
  { id: 'media', label: 'Media' },
  { id: 'categories', label: 'Categories' },
  { id: 'variants', label: 'Variants' },
  { id: 'features', label: 'Features' },
  { id: 'specs', label: 'Specifications' },
  { id: 'offers', label: 'Offers' },
  { id: 'status', label: 'Status' },
];

export default function ProductForm({ initialData = null, categories = [] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [isNew] = useState(!initialData);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const toggleImageSelect = (idx) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectAllImages = () => {
    if (selectedImages.size === formData.images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(formData.images.map((_, i) => i)));
    }
  };

  const bulkDeleteImages = async () => {
    if (selectedImages.size === 0) return;
    if (!window.confirm(`Delete ${selectedImages.size} selected image${selectedImages.size > 1 ? 's' : ''}? This cannot be undone.`)) return;

    const indicesToDelete = Array.from(selectedImages).sort((a, b) => b - a); // Delete from end to preserve indices
    for (const idx of indicesToDelete) {
      const img = formData.images[idx];
      if (img?.src) await deleteFile(img.src, BUCKETS.PRODUCTS);
    }

    const deleteSet = new Set(indicesToDelete);
    const newImages = formData.images.filter((_, i) => !deleteSet.has(i));
    newImages.forEach((img, idx) => {
      img.sortOrder = idx;
      img.isFeatured = idx === 0;
    });
    setFormData(prev => ({ ...prev, images: newImages }));
    setSelectedImages(new Set());
    setSelectMode(false);
    addToast({ title: `${indicesToDelete.length} image${indicesToDelete.length > 1 ? 's' : ''} deleted`, type: 'success' });
  };

  // Form State
  const getInitialFormState = () => ({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortName: initialData?.shortName || '',
    description: initialData?.description || '', // HTML
    price: initialData?.price || 0,
    originalPrice: initialData?.originalPrice || 0,
    discount: initialData?.discount || 0,
    stock: initialData?.stock || 0,
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    seoKeywords: initialData?.seoKeywords || '',
    categoryId: initialData?.categoryId || '',
    status: initialData?.status || 'draft',
    isFeatured: initialData?.isFeatured || false,
    images: initialData?.images || [], // { id?, src, sortOrder, isFeatured }
    variants: initialData?.variants || [],
    features: initialData?.features || [],
    specs: initialData?.specs || [],
    offers: initialData?.offers || [],
  });

  const [formData, setFormData] = useState(getInitialFormState());
  const [savedDataString, setSavedDataString] = useState(JSON.stringify(getInitialFormState()));

  const isDirty = JSON.stringify(formData) !== savedDataString;
  const setDirty = useAdminStore((state) => state.setDirty);

  useEffect(() => {
    setDirty(isDirty);
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      setDirty(false); // Cleanup on unmount
    };
  }, [isDirty, setDirty]);

  // Slug generation helper
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (isNew || formData.slug === generateSlug(formData.name)) {
      setFormData({ ...formData, name: val, slug: generateSlug(val) });
    } else {
      setFormData({ ...formData, name: val });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  // Image Upload Handling
  const [uploadingImage, setUploadingImage] = useState(false);
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);

    const newImages = [];
    for (const file of files) {
      const { success, url, error } = await uploadFile(file, BUCKETS.PRODUCTS);
      if (success) {
        newImages.push({ src: url, sortOrder: formData.images.length + newImages.length, isFeatured: formData.images.length === 0 && newImages.length === 0 });
      } else {
        addToast({ title: 'Upload failed', message: `${file.name}: ${error}`, type: 'error' });
      }
    }

    if (newImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      addToast({ title: `${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded`, type: 'success' });
    }
    setUploadingImage(false);
    e.target.value = ''; // Reset input so same files can be re-selected
  };

  const handleThumbnailReplace = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const { success, url, error } = await uploadFile(file, BUCKETS.PRODUCTS);
    if (success) {
      const newImages = [...formData.images];
      if (newImages.length > 0) {
        newImages[0] = { ...newImages[0], src: url };
      } else {
        newImages.push({ src: url, sortOrder: 0, isFeatured: true });
      }
      setFormData({ ...formData, images: newImages });
      addToast({ title: 'Thumbnail updated', type: 'success' });
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setUploadingImage(false);
  };

  const removeImage = async (index) => {
    const img = formData.images[index];
    if (img.src) await deleteFile(img.src, BUCKETS.PRODUCTS);
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  // Variant Image Upload Handling
  const handleVariantImageUpload = async (e, variantIndex) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);

    const newImages = [];
    for (const file of files) {
      const { success, url, error } = await uploadFile(file, BUCKETS.PRODUCTS);
      if (success) {
        newImages.push({ src: url });
      } else {
        addToast({ title: 'Upload failed', message: error, type: 'error' });
      }
    }

    if (newImages.length > 0) {
      const newVariants = [...formData.variants];
      newVariants[variantIndex] = { ...newVariants[variantIndex] };
      newVariants[variantIndex].images = [...(newVariants[variantIndex].images || []), ...newImages];
      setFormData({ ...formData, variants: newVariants });
      addToast({ title: 'Images uploaded', type: 'success' });
    }
    setUploadingImage(false);
  };

  const removeVariantImage = async (variantIndex, imageIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex] = { ...newVariants[variantIndex] };
    const newImages = [...(newVariants[variantIndex].images || [])];
    const img = newImages[imageIndex];
    if (img.src) await deleteFile(img.src, BUCKETS.PRODUCTS);
    newImages.splice(imageIndex, 1);
    newVariants[variantIndex].images = newImages;
    setFormData({ ...formData, variants: newVariants });
  };

  // Drag and Drop for Variant Images
  const handleDragStart = (e, variantIndex, imageIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ variantIndex, imageIndex }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetVariantIndex, targetImageIndex) => {
    e.preventDefault();
    setDragOverItem(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.variantIndex !== targetVariantIndex) return; // Only allow reordering within the same variant
      if (data.imageIndex === targetImageIndex) return;

      const newVariants = [...formData.variants];
      newVariants[targetVariantIndex] = { ...newVariants[targetVariantIndex] };
      const variantImages = [...(newVariants[targetVariantIndex].images || [])];

      const [draggedItem] = variantImages.splice(data.imageIndex, 1);
      variantImages.splice(targetImageIndex, 0, draggedItem);

      newVariants[targetVariantIndex].images = variantImages;
      setFormData({ ...formData, variants: newVariants });
    } catch (err) { }
  };

  const handleDragOver = (e, targetVariantIndex, targetImageIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverItem || dragOverItem.variantIndex !== targetVariantIndex || dragOverItem.imageIndex !== targetImageIndex) {
      setDragOverItem({ variantIndex: targetVariantIndex, imageIndex: targetImageIndex });
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverItem(null);
  };

  // Move base image to a new position
  const moveBaseImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= formData.images.length) return;
    const newImages = [...formData.images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    newImages.forEach((img, idx) => {
      img.sortOrder = idx;
      img.isFeatured = idx === 0;
    });
    setFormData({ ...formData, images: newImages });
  };

  const setAsFeatured = (index) => {
    if (index === 0) return;
    moveBaseImage(index, 0);
  };

  // Drag and Drop for Base Images
  const handleBaseDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ baseImageIndex: index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBaseDrop = (e, targetIndex) => {
    e.preventDefault();
    setDragOverItem(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.baseImageIndex === undefined || data.baseImageIndex === targetIndex) return;

      const newImages = [...formData.images];
      const [draggedItem] = newImages.splice(data.baseImageIndex, 1);
      newImages.splice(targetIndex, 0, draggedItem);

      // Update sort orders and featured status
      newImages.forEach((img, idx) => {
        img.sortOrder = idx;
        img.isFeatured = idx === 0;
      });

      setFormData({ ...formData, images: newImages });
    } catch (err) { }
  };

  const handleBaseDragOver = (e, targetIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverItem || dragOverItem.baseImageIndex !== targetIndex) {
      setDragOverItem({ baseImageIndex: targetIndex });
    }
  };

  // Dynamic Array Handlers (Variants, Features, Specs)
  const addArrayItem = (key, defaultItem) => setFormData({ ...formData, [key]: [...formData[key], defaultItem] });
  const updateArrayItem = (key, index, field, value) => {
    const newArray = [...formData[key]];
    newArray[index][field] = value;
    setFormData({ ...formData, [key]: newArray });
  };
  const removeArrayItem = (key, index) => setFormData({ ...formData, [key]: formData[key].filter((_, i) => i !== index) });

  const [deletingVariantIndex, setDeletingVariantIndex] = useState(null);

  const handleRemoveVariant = async (index) => {
    if (!window.confirm('Are you sure you want to permanently delete this variant?')) {
      return;
    }

    setDeletingVariantIndex(index);
    const variant = formData.variants[index];

    // Delete images from storage first
    if (variant.images && variant.images.length > 0) {
      for (const img of variant.images) {
        if (img.src) await deleteFile(img.src, BUCKETS.PRODUCTS);
      }
    }

    // Delete directly from database if it exists
    if (variant.id) {
      const res = await deleteProductVariant(variant.id);
      if (!res.success) {
        addToast({ title: 'Error', message: 'Failed to delete from database.', type: 'error' });
        setDeletingVariantIndex(null);
        return; // Stop if db delete failed
      }
    }

    // Remove from UI state
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
    // Also update initialData so arraysEqual knows it's actually removed from db
    if (initialData?.variants) {
      initialData.variants = initialData.variants.filter((_, i) => i !== index);
    }

    setDeletingVariantIndex(null);
    addToast({ title: 'Deleted', message: 'Variant deleted permanently.', type: 'success' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Auto-sync product-level fields from variants
    const saveData = { ...formData };
    if (saveData.variants && saveData.variants.length > 0) {
      saveData.stock = saveData.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
      // Sync price from cheapest variant
      const prices = saveData.variants.map(v => parseFloat(v.price) || 0).filter(p => p > 0);
      const origPrices = saveData.variants.map(v => parseFloat(v.originalPrice) || 0).filter(p => p > 0);
      if (prices.length > 0) {
        saveData.price = Math.min(...prices);
      }
      if (origPrices.length > 0) {
        saveData.originalPrice = Math.min(...origPrices);
      }
      if (saveData.originalPrice > saveData.price) {
        saveData.discount = Math.round(((saveData.originalPrice - saveData.price) / saveData.originalPrice) * 100);
      }
    }

    let result;
    if (isNew) {
      result = await createProduct(saveData);
    } else {
      result = await updateProduct(initialData.id, saveData);
    }

    if (result.success) {
      const productId = result.product.id;
      // Only save arrays if they were actually changed
      const arraysEqual = (a1, a2) => JSON.stringify(a1 || []) === JSON.stringify(a2 || []);

      if (!arraysEqual(initialData?.variants, formData.variants)) {
        await saveProductVariants(productId, formData.variants);
      }
      if (!arraysEqual(initialData?.features, formData.features)) {
        await saveProductFeatures(productId, formData.features);
      }
      if (!arraysEqual(initialData?.specs, formData.specs)) {
        await saveProductSpecs(productId, formData.specs);
      }
      if (!arraysEqual(initialData?.images, formData.images)) {
        await saveProductImages(productId, formData.images);
      }
      if (!arraysEqual(initialData?.offers, formData.offers)) {
        await saveProductOffers(productId, formData.offers);
      }

      setSavedDataString(JSON.stringify(formData)); // Reset dirty state
      addToast({ title: 'Success', message: 'Product saved successfully', type: 'success' });
      if (isNew) router.push(`/admin/products/${productId}/edit`);
      else router.refresh();
    } else {
      addToast({ title: 'Error', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  const handleDuplicate = async () => {
    setLoading(true);
    const copyData = { ...formData, name: `${formData.name} (Copy)`, slug: `${formData.slug}-copy`, status: 'draft' };
    const result = await createProduct(copyData);
    if (result.success) {
      const productId = result.product.id;
      await Promise.all([
        saveProductVariants(productId, formData.variants),
        saveProductFeatures(productId, formData.features),
        saveProductSpecs(productId, formData.specs),
        saveProductImages(productId, formData.images),
        saveProductOffers(productId, formData.offers)
      ]);
      addToast({ title: 'Duplicated', message: 'Product duplicated successfully', type: 'success' });
      router.push(`/admin/products/${productId}/edit`);
    } else {
      addToast({ title: 'Error', message: result.error, type: 'error' });
    }
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">{isNew ? 'Create Product' : 'Edit Product'}</h1>
            <p className="text-sm text-gray-500 mt-1">{formData.name || 'New Product'}</p>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <>
                <Button type="button" variant="outline" onClick={() => setShowFaqModal(true)}>
                  <HelpCircle size={16} className="mr-2" /> FAQs
                </Button>
                <Button type="button" variant="outline" onClick={() => window.open(`/preview/${initialData.id}`, '_blank')}>
                  <Eye size={16} className="mr-2" /> Preview
                </Button>
                <Button type="button" variant="outline" onClick={handleDuplicate}>
                  <Copy size={16} className="mr-2" /> Duplicate
                </Button>
              </>
            )}
            <Button
              type="submit"
              disabled={loading || (!isDirty && !isNew)}
              className={isDirty || isNew ? "bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover" : "bg-gray-200 text-gray-500 hover:bg-gray-200"}
            >
              {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              {isNew ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-48 flex-shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible border-b lg:border-none border-brand-border pb-2 lg:pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-brand-yellow/20 text-brand-black font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white border border-brand-border rounded-xl p-6 min-h-[500px]">

            {/* GENERAL */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <Input name="name" value={formData.name} onChange={handleNameChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Name (Cards)</label>
                    <Input name="shortName" value={formData.shortName} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <div className="flex gap-2">
                      <Input name="slug" value={formData.slug} onChange={handleChange} required className="flex-1" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, slug: generateSlug(formData.name) })}
                        className="px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 transition-colors whitespace-nowrap"
                        title="Generate slug from product name"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rich Description</label>
                  <RichTextEditor value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Thumbnail</label>
                  <div className="flex gap-4 items-start mt-2">
                    {formData.images.length > 0 ? (
                      <div className="relative group w-32 h-32 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                        {isVideo(formData.images[0].src) ? (
                          <video src={formData.images[0].src} className="max-w-full max-h-full object-contain" autoPlay loop muted playsInline />
                        ) : (
                          <img src={formData.images[0].src} alt="Thumbnail" className="max-w-full max-h-full object-contain" />
                        )}
                        <button type="button" onClick={() => removeImage(0)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 shrink-0">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" className="relative cursor-pointer w-fit">
                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                        {uploadingImage ? 'Uploading...' : (formData.images.length > 0 ? 'Replace Thumbnail' : 'Upload Thumbnail')}
                        <input type="file" accept="image/*" onChange={handleThumbnailReplace} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImage} />
                      </Button>
                      <p className="text-xs text-gray-500 max-w-sm">This image will be used as the primary display image across the store and in the product grid.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRICING */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {formData.variants && formData.variants.length > 0 ? (
                  <div>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                      <strong>Variant Pricing Active:</strong> This product has variants. Configure the price for each specific option below.
                    </div>
                    <div className="space-y-4">
                      {formData.variants.map((v, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 border border-brand-border rounded-lg bg-gray-50">
                          <div className="font-semibold text-brand-black">{v.name || `Variant ${i + 1}`}</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Selling Price</label>
                              <Input type="number" value={v.price} onChange={(e) => updateArrayItem('variants', i, 'price', parseFloat(e.target.value))} required min="0" step="0.01" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Original Price (MRP)</label>
                              <Input type="number" value={v.originalPrice} onChange={(e) => updateArrayItem('variants', i, 'originalPrice', parseFloat(e.target.value))} min="0" step="0.01" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
                      <Input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (MRP)</label>
                      <Input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} min="0" step="0.01" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                      <Input type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                {formData.variants && formData.variants.length > 0 ? (
                  <div>
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                      <strong>Variant Inventory Active:</strong> This product has variants. Configure the stock quantity for each specific option below.
                    </div>
                    <div className="space-y-4">
                      {formData.variants.map((v, i) => (
                        <div key={i} className="flex flex-col gap-2 p-4 border border-brand-border rounded-lg bg-gray-50">
                          <div className="font-semibold text-brand-black">{v.name || `Variant ${i + 1}`}</div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity</label>
                              <Input type="number" value={v.stock} onChange={(e) => updateArrayItem('variants', i, 'stock', parseInt(e.target.value, 10))} min="0" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <Input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" />
                  </div>
                )}
              </div>
            )}

            {/* SEO */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
                  <Input name="seoTitle" value={formData.seoTitle} onChange={handleChange} placeholder="Keep under 60 characters" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
                  <textarea name="seoDescription" value={formData.seoDescription} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none h-24 text-gray-900 bg-white" placeholder="Keep under 160 characters" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
                  <Input name="seoKeywords" value={formData.seoKeywords} onChange={handleChange} placeholder="Comma separated" />
                </div>
              </div>
            )}

            {/* MEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button type="button" variant="outline" className="relative cursor-pointer">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}
                      {uploadingImage ? 'Uploading...' : 'Upload Images'}
                      <input type="file" multiple accept="image/*,video/mp4,video/webm" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImage} />
                    </Button>
                    {formData.images.length > 0 && (
                      <Button
                        type="button"
                        variant={selectMode ? 'default' : 'outline'}
                        onClick={() => { setSelectMode(!selectMode); setSelectedImages(new Set()); }}
                        className={selectMode ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                      >
                        <CheckSquare size={16} className="mr-2" />
                        {selectMode ? 'Cancel Select' : 'Select'}
                      </Button>
                    )}
                  </div>
                  {selectMode && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllImages}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                      >
                        {selectedImages.size === formData.images.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={bulkDeleteImages}
                        disabled={selectedImages.size === 0}
                        className={selectedImages.size > 0 ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete {selectedImages.size > 0 ? `(${selectedImages.size})` : ''}
                      </Button>
                    </div>
                  )}
                </div>
                {!selectMode && (
                  <span className="text-sm text-gray-500 block -mt-2 mb-2">First image is the featured cover. Drag or use arrows to reorder.</span>
                )}
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4">
                  <strong>Base Product Images:</strong> These images are shown by default. If a variant has its own specific images uploaded, those will override these base images when the variant is selected.
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.images.map((img, idx) => (
                    <div
                      key={idx}
                      draggable={!selectMode}
                      onDragStart={(e) => !selectMode && handleBaseDragStart(e, idx)}
                      onDrop={(e) => !selectMode && handleBaseDrop(e, idx)}
                      onDragOver={(e) => !selectMode && handleBaseDragOver(e, idx)}
                      onDragLeave={handleDragLeave}
                      onClick={() => selectMode && toggleImageSelect(idx)}
                      className={`relative aspect-square border-2 rounded-lg overflow-hidden group transition-all ${selectMode
                        ? selectedImages.has(idx)
                          ? 'border-blue-500 ring-2 ring-blue-300 scale-[0.97]'
                          : 'border-brand-border cursor-pointer hover:border-blue-300'
                        : dragOverItem?.baseImageIndex === idx
                          ? 'border-brand-yellow scale-105 shadow-md cursor-grab active:cursor-grabbing'
                          : idx === 0 ? 'border-brand-yellow cursor-grab active:cursor-grabbing' : 'border-brand-border cursor-grab active:cursor-grabbing'
                        }`}
                    >
                      {isVideo(img.src) ? (
                        <video src={img.src} className="w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline />
                      ) : (
                        <img src={img.src} alt="" className="w-full h-full object-cover pointer-events-none" />
                      )}
                      {/* Select mode checkbox overlay */}
                      {selectMode && (
                        <div className={`absolute inset-0 transition-colors ${selectedImages.has(idx) ? 'bg-blue-500/20' : 'hover:bg-black/10'}`}>
                          <div className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${selectedImages.has(idx)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-white/90 border-gray-400'
                            }`}>
                            {selectedImages.has(idx) && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                          </div>
                        </div>
                      )}
                      {/* Position number badge - only in normal mode */}
                      {!selectMode && (
                        <span className={`absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold ${idx === 0 ? 'bg-brand-yellow text-brand-black' : 'bg-black/60 text-white'
                          }`}>{idx + 1}</span>
                      )}
                      {/* Action buttons - visible on hover, only in normal mode */}
                      {!selectMode && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx !== 0 && (
                            <button type="button" onClick={() => setAsFeatured(idx)} title="Set as Featured (move to 1st)" className="p-1.5 bg-brand-yellow text-brand-black rounded-md hover:bg-yellow-400 transition-colors">
                              <Star size={13} />
                            </button>
                          )}
                          <button type="button" onClick={() => removeImage(idx)} title="Delete" className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                      {/* Move arrows - visible on hover, only in normal mode */}
                      {!selectMode && (
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {idx > 0 && (
                            <button type="button" onClick={() => moveBaseImage(idx, idx - 1)} title="Move left" className="p-1 bg-black/60 text-white rounded hover:bg-black/80 transition-colors">
                              <ChevronLeft size={14} />
                            </button>
                          )}
                          {idx < formData.images.length - 1 && (
                            <button type="button" onClick={() => moveBaseImage(idx, idx + 1)} title="Move right" className="p-1 bg-black/60 text-white rounded hover:bg-black/80 transition-colors">
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      )}
                      {/* Featured label */}
                      {idx === 0 && !selectMode && <span className="absolute bottom-2 left-2 bg-brand-yellow text-brand-black text-[10px] font-bold px-2 py-0.5 rounded-md">Featured</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Category</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none text-gray-900 bg-white">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* VARIANTS */}
            {activeTab === 'variants' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-brand-black">Product Variants (e.g. Pack sizes)</h3>
                    <p className="text-xs text-gray-500 mt-1">Configure pricing, stock, and specific images for each option.</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('variants', { name: '', price: 0, originalPrice: 0, stock: 0, isBestSeller: false, images: [], badgeText: '', savingsText: '', keyPoints: [] })}>
                    <Plus size={14} className="mr-1" /> Add Variant
                  </Button>
                </div>
                {formData.variants.map((v, i) => (
                  <div key={i} className="flex flex-col gap-4 p-4 border border-brand-border rounded-lg bg-gray-50">
                    <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                      <GripVertical size={16} className="text-gray-400 cursor-move" />
                      <Input placeholder="Name (e.g. Pack of 1)" value={v.name} onChange={(e) => updateArrayItem('variants', i, 'name', e.target.value)} className="flex-1 min-w-[120px]" />
                      <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider pl-1">Selling</span>
                          <Input type="number" placeholder="Selling" value={v.price === 0 ? '' : v.price} onChange={(e) => updateArrayItem('variants', i, 'price', parseFloat(e.target.value) || 0)} className="w-24" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider pl-1">MRP</span>
                          <Input type="number" placeholder="MRP" value={v.originalPrice === 0 ? '' : v.originalPrice} onChange={(e) => updateArrayItem('variants', i, 'originalPrice', parseFloat(e.target.value) || 0)} className="w-24" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider pl-1">Stock</span>
                          <Input type="number" placeholder="Stock" value={v.stock === 0 ? '' : v.stock} onChange={(e) => updateArrayItem('variants', i, 'stock', parseInt(e.target.value, 10) || 0)} className="w-20" />
                        </div>
                        <div className="flex items-center gap-2 ml-2 mr-2 mb-3">
                          <input
                            type="checkbox"
                            id={`bestSeller-${i}`}
                            checked={v.isBestSeller || false}
                            onChange={(e) => updateArrayItem('variants', i, 'isBestSeller', e.target.checked)}
                            className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor={`bestSeller-${i}`} className="text-xs font-semibold text-gray-700 cursor-pointer whitespace-nowrap">
                            Best Seller Tag
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          disabled={deletingVariantIndex === i}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-1 disabled:opacity-50"
                        >
                          {deletingVariantIndex === i ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="pl-6 flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded border border-gray-200">
                        <div>
                          <span className="text-sm font-bold text-gray-800 block">Variant-Specific Images (Optional)</span>
                          <span className="text-xs text-gray-500">Only upload images here if this variant looks different. Otherwise, leave empty to use base images.</span>
                        </div>
                        <Button type="button" variant="outline" size="sm" className="relative cursor-pointer sm:ml-auto flex-shrink-0">
                          {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus size={14} className="mr-1" />} Upload Variant Images
                          <input type="file" multiple accept="image/*" onChange={(e) => handleVariantImageUpload(e, i)} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingImage} />
                        </Button>
                      </div>

                      <div className="bg-white p-4 rounded border border-gray-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700">Badge Text (Optional)</label>
                            <Input placeholder="e.g. 🔥 MOST POPULAR | FLAT ₹249 SAVINGS" value={v.badgeText || ''} onChange={(e) => updateArrayItem('variants', i, 'badgeText', e.target.value)} className="text-sm" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-700">Savings Text (Optional)</label>
                            <Input placeholder="e.g. Save Flat ₹599" value={v.savingsText || ''} onChange={(e) => updateArrayItem('variants', i, 'savingsText', e.target.value)} className="text-sm" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-gray-700">Key Points / Free Gifts</label>
                          <p className="text-[10px] text-gray-500 mb-1">Enter one point per line. You can use emojis (e.g. 🎁 FREE GIFT: 1x Mirror).</p>
                          <textarea
                            rows={4}
                            value={v.keyPoints?.join('\n') || ''}
                            onChange={(e) => updateArrayItem('variants', i, 'keyPoints', e.target.value.split('\n'))}
                            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none bg-white text-gray-900"
                            placeholder="1 Piece Premium Microfiber (1200 GSM)&#10;🎁 FREE GIFT: 1x Car Blind Spot Mirror"
                          />
                        </div>
                      </div>
                      {v.images && v.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {v.images.map((img, imgIdx) => (
                            <div
                              key={imgIdx}
                              draggable
                              onDragStart={(e) => handleDragStart(e, i, imgIdx)}
                              onDrop={(e) => handleDrop(e, i, imgIdx)}
                              onDragOver={(e) => handleDragOver(e, i, imgIdx)}
                              onDragLeave={handleDragLeave}
                              className={`relative w-16 h-16 border rounded overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${dragOverItem?.variantIndex === i && dragOverItem?.imageIndex === imgIdx
                                ? 'border-brand-yellow border-2 scale-105 shadow-md'
                                : 'border-brand-border'
                                }`}
                            >
                              {isVideo(img.src) ? (
                                <video src={img.src} className="w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline />
                              ) : (
                                <img src={img.src} alt="" className="w-full h-full object-cover pointer-events-none" />
                              )}
                              <button type="button" onClick={() => removeVariantImage(i, imgIdx)} className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEATURES */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-brand-black">Bullet Features</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('features', { bold: '', text: '' })}>
                    <Plus size={14} className="mr-1" /> Add Feature
                  </Button>
                </div>
                {formData.features.map((f, i) => (
                  <div key={i} className="flex gap-2 items-center p-3 border border-brand-border rounded-lg bg-gray-50">
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <Input placeholder="Bold Label" value={f.bold} onChange={(e) => updateArrayItem('features', i, 'bold', e.target.value)} className="w-1/3" />
                    <Input placeholder="Description" value={f.text} onChange={(e) => updateArrayItem('features', i, 'text', e.target.value)} className="flex-1" />
                    <button type="button" onClick={() => removeArrayItem('features', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* SPECS */}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-brand-black">Specifications Table</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('specs', { label: '', value: '' })}>
                    <Plus size={14} className="mr-1" /> Add Spec
                  </Button>
                </div>
                {formData.specs.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center p-3 border border-brand-border rounded-lg bg-gray-50">
                    <GripVertical size={16} className="text-gray-400 cursor-move" />
                    <Input placeholder="Label (e.g. Material)" value={s.label} onChange={(e) => updateArrayItem('specs', i, 'label', e.target.value)} className="w-1/2" />
                    <Input placeholder="Value (e.g. 1200 GSM)" value={s.value} onChange={(e) => updateArrayItem('specs', i, 'value', e.target.value)} className="w-1/2" />
                    <button type="button" onClick={() => removeArrayItem('specs', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* OFFERS */}
            {activeTab === 'offers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-brand-black">Product Offers (Countdown Banners)</h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem('offers', { 
                    title: 'Special Offer', 
                    subtitle: '', 
                    badgeText: 'Limited Time', 
                    ctaText: 'Shop Now', 
                    expiredMessage: 'This offer has ended',
                    bgTheme: 'gradient-fire',
                    startDate: new Date().toISOString().slice(0,16), 
                    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0,16),
                    isActive: true,
                    showCountdown: true,
                    priority: 0,
                    position: 'above-packs'
                  })}>
                    <Plus size={14} className="mr-1" /> Add Offer
                  </Button>
                </div>
                
                {formData.offers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                    <Star size={32} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No offers configured</h3>
                    <p className="text-sm text-gray-500 mb-4">Add a countdown banner or special offer for this product.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.offers.map((offer, i) => (
                      <div key={i} className="p-5 border border-brand-border rounded-xl bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={offer.isActive} onChange={(e) => updateArrayItem('offers', i, 'isActive', e.target.checked)} className="w-4 h-4 text-brand-yellow rounded border-gray-300" />
                            <span className="font-medium">Offer Active</span>
                          </div>
                          <button type="button" onClick={() => removeArrayItem('offers', i)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm flex items-center">
                            <Trash2 size={16} className="mr-1" /> Remove
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                            <Input value={offer.title} onChange={(e) => updateArrayItem('offers', i, 'title', e.target.value)} placeholder="e.g. 🔥 Independence Day Mega Offer" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
                            <Input value={offer.subtitle || ''} onChange={(e) => updateArrayItem('offers', i, 'subtitle', e.target.value)} placeholder="e.g. Save up to 40% on packs" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Badge Text</label>
                            <Input value={offer.badgeText || ''} onChange={(e) => updateArrayItem('offers', i, 'badgeText', e.target.value)} placeholder="e.g. ⚡ Flash Sale" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">CTA Text</label>
                            <Input value={offer.ctaText || ''} onChange={(e) => updateArrayItem('offers', i, 'ctaText', e.target.value)} placeholder="e.g. Grab Now" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date & Time</label>
                            <Input type="datetime-local" value={offer.startDate ? new Date(offer.startDate).toISOString().slice(0, 16) : ''} onChange={(e) => updateArrayItem('offers', i, 'startDate', new Date(e.target.value).toISOString())} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date & Time</label>
                            <Input type="datetime-local" value={offer.endDate ? new Date(offer.endDate).toISOString().slice(0, 16) : ''} onChange={(e) => updateArrayItem('offers', i, 'endDate', new Date(e.target.value).toISOString())} />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Theme</label>
                            <select value={offer.bgTheme} onChange={(e) => updateArrayItem('offers', i, 'bgTheme', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow outline-none text-sm">
                              <option value="gradient-fire">🔥 Fire Gradient (Red/Orange)</option>
                              <option value="gradient-ocean">🌊 Ocean Gradient (Blue/Teal)</option>
                              <option value="gradient-midnight">🌙 Midnight (Dark/Purple)</option>
                              <option value="gradient-forest">🌲 Forest (Green)</option>
                              <option value="solid-black">⚫ Solid Black</option>
                              <option value="brand-yellow">🟡 Brand Yellow</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                            <select value={offer.position} onChange={(e) => updateArrayItem('offers', i, 'position', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow outline-none text-sm">
                              <option value="above-packs">Above Pack Selection</option>
                              <option value="top-of-page">Top of Page (Under Header)</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-2 pt-2 border-t border-gray-100 flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={offer.showCountdown} onChange={(e) => updateArrayItem('offers', i, 'showCountdown', e.target.checked)} className="w-4 h-4 text-brand-yellow rounded border-gray-300" />
                              <span className="text-sm font-medium">Show live countdown timer</span>
                            </label>
                            <div className="flex-1 max-w-xs">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Priority (Higher shows first)</label>
                                <Input type="number" value={offer.priority || 0} onChange={(e) => updateArrayItem('offers', i, 'priority', parseInt(e.target.value))} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STATUS */}
            {activeTab === 'status' && (
              <div className="space-y-6 max-w-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publication Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow focus:border-brand-yellow outline-none text-gray-900 bg-white">
                    <option value="active">Active (Published)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 p-4 border border-brand-border rounded-lg bg-gray-50">
                  <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300 rounded" />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-brand-black cursor-pointer">
                    Featured Product (Shows on Homepage)
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>
      </form>

      {!isNew && (
        <ProductFaqModal
          isOpen={showFaqModal}
          onClose={() => setShowFaqModal(false)}
          product={initialData}
        />
      )}
    </>
  );
}
