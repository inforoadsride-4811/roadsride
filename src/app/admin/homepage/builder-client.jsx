'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { uploadFile, deleteFile, BUCKETS } from '@/lib/storage';
import { updateHomepageSection, createHomepageSection, deleteHomepageSection, getProductsForManualSelection } from '@/actions/admin-homepage';

export default function HomepageSettingsClient({ sections, categories }) {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  
  const [uploadingHero, setUploadingHero] = useState({});
  const [uploadingPromo, setUploadingPromo] = useState(false);

  // Group sections by type
  const heroSlides = sections.filter(s => s.type === 'HERO').sort((a, b) => a.order - b.order);
  const categoriesSec = sections.find(s => s.type === 'CATEGORIES') || { type: 'CATEGORIES', title: 'Explore Categories', isActive: true };
  const productsSec = sections.find(s => s.type === 'PRODUCTS') || { type: 'PRODUCTS', title: 'Best Sellers', productMode: 'AUTOMATIC_CATEGORY', categoryId: '', isActive: true, manualProducts: [] };
  const promoSec = sections.find(s => s.type === 'PROMO_BENTO') || { type: 'PROMO_BENTO', title: 'Precision Detailing.', subtitle: 'Ultimate Performance.', linkText: 'Shop Now', linkUrl: '/', imageUrl: '', isActive: true };
  const ctaSec = sections.find(s => s.type === 'CTA') || { type: 'CTA', title: 'Ready to Transform Your Ride?', subtitle: 'Join thousands of satisfied enthusiasts.', linkText: 'Shop All Products', linkUrl: '/', isActive: true };

  // State for forms
  const [heroState, setHeroState] = useState(heroSlides);
  const [catState, setCatState] = useState(categoriesSec);
  const [prodState, setProdState] = useState(productsSec);
  const [promoState, setPromoState] = useState(promoSec);
  const [ctaState, setCtaState] = useState(ctaSec);

  // --- Handlers for Hero Slides ---
  const addHeroSlide = () => {
    setHeroState([...heroState, { id: `temp-${Date.now()}`, type: 'HERO', title: '', subtitle: '', badge: '', linkText: '', linkUrl: '', imageUrl: '', order: heroState.length }]);
  };

  const removeHeroSlide = async (index, id) => {
    if (!id.startsWith('temp-')) {
      await deleteHomepageSection(id);
    }
    setHeroState(heroState.filter((_, i) => i !== index));
  };

  const updateHeroSlide = (index, field, value) => {
    const newSlides = [...heroState];
    newSlides[index][field] = value;
    setHeroState(newSlides);
  };

  const handleHeroImageUpload = async (index, file) => {
    if (!file) return;
    setUploadingHero(prev => ({ ...prev, [index]: true }));
    const { success, url, error } = await uploadFile(file, BUCKETS.BANNERS);
    if (success) {
      updateHeroSlide(index, 'imageUrl', url);
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setUploadingHero(prev => ({ ...prev, [index]: false }));
  };

  // --- Handlers for Products Section ---
  const searchProducts = async (query) => {
    setProductSearch(query);
    if (!query) return setSearchResults([]);
    
    setSearching(true);
    const res = await getProductsForManualSelection(query);
    if (res.success) setSearchResults(res.products);
    setSearching(false);
  };

  const addManualProduct = (product) => {
    const currentList = prodState.manualProducts || [];
    if (currentList.find(p => p.product?.id === product.id || p.id === product.id)) return;
    setProdState({
      ...prodState,
      manualProducts: [...currentList, { product }] // wrap to match structure
    });
    setProductSearch('');
    setSearchResults([]);
  };

  const removeManualProduct = (productId) => {
    setProdState({
      ...prodState,
      manualProducts: (prodState.manualProducts || []).filter(p => p.product.id !== productId)
    });
  };

  // --- Generic Image Upload ---
  const handleGenericImageUpload = async (file, stateUpdater, currentState) => {
    if (!file) return;
    setUploadingPromo(true);
    const { success, url, error } = await uploadFile(file, BUCKETS.BANNERS);
    if (success) {
      stateUpdater({ ...currentState, imageUrl: url });
    } else {
      addToast({ title: 'Upload failed', message: error, type: 'error' });
    }
    setUploadingPromo(false);
  };

  // --- Save All ---
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // 1. Save Hero Slides
      for (let i = 0; i < heroState.length; i++) {
        const slide = heroState[i];
        const payload = { ...slide, order: i };
        if (slide.id.startsWith('temp-')) {
          delete payload.id;
          await createHomepageSection(payload);
        } else {
          await updateHomepageSection(slide.id, payload);
        }
      }

      // 2. Save Categories Sec
      if (catState.id) await updateHomepageSection(catState.id, catState);
      else await createHomepageSection({ ...catState, order: 10 });

      // 3. Save Products Sec
      const prodPayload = { ...prodState };
      if (prodPayload.productMode === 'MANUAL') {
        prodPayload.productIds = (prodPayload.manualProducts || []).map(p => p.product.id);
        prodPayload.categoryId = null;
      } else {
        prodPayload.productIds = [];
        if (!prodPayload.categoryId || prodPayload.categoryId === '') {
          prodPayload.categoryId = null;
        }
      }
      delete prodPayload.manualProducts;
      
      if (prodState.id) await updateHomepageSection(prodState.id, prodPayload);
      else await createHomepageSection({ ...prodPayload, order: 20 });

      // 4. Save Promo Bento
      if (promoState.id) await updateHomepageSection(promoState.id, promoState);
      else await createHomepageSection({ ...promoState, order: 30 });

      // 5. Save CTA
      if (ctaState.id) await updateHomepageSection(ctaState.id, ctaState);
      else await createHomepageSection({ ...ctaState, order: 40 });

      addToast({ title: 'Success', message: 'Homepage data updated successfully.', type: 'success' });
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', message: 'Something went wrong while saving.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-4xl pb-24">

      {/* 1. HERO CAROUSEL */}
      <section className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-black mb-4">1. Hero Banner Carousel</h2>
        <p className="text-sm text-gray-500 mb-6">Add multiple banners to create a sliding carousel like Amazon.</p>
        
        <div className="space-y-6">
          {heroState.map((slide, index) => (
            <div key={slide.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
              <button 
                onClick={() => removeHeroSlide(index, slide.id)}
                className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-md"
              >
                <Trash2 size={18} />
              </button>
              
              <h3 className="font-semibold mb-4">Slide {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Title</label>
                  <Input value={slide.title || ''} onChange={e => updateHeroSlide(index, 'title', e.target.value)} placeholder="Precision Detailing." />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Subtitle</label>
                  <Input value={slide.subtitle || ''} onChange={e => updateHeroSlide(index, 'subtitle', e.target.value)} placeholder="Ultimate performance." />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Small Badge</label>
                  <Input value={slide.badge || ''} onChange={e => updateHeroSlide(index, 'badge', e.target.value)} placeholder="NEW ARRIVALS" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Button Text</label>
                  <Input value={slide.linkText || ''} onChange={e => updateHeroSlide(index, 'linkText', e.target.value)} placeholder="Shop Now" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Button Link</label>
                  <Input value={slide.linkUrl || ''} onChange={e => updateHeroSlide(index, 'linkUrl', e.target.value)} placeholder="/#shop" />
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Background Image</label>
                  <div className="flex items-center gap-4">
                    {slide.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.imageUrl} alt="" className="w-24 h-16 object-cover rounded border" />
                    )}
                    <Button type="button" variant="outline" className="relative overflow-hidden cursor-pointer flex-1">
                      {uploadingHero[index] ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon size={16} className="mr-2" />}
                      {uploadingHero[index] ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={(e) => handleHeroImageUpload(index, e.target.files[0])} disabled={uploadingHero[index]} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addHeroSlide} className="w-full border-dashed">
            <Plus size={16} className="mr-2" /> Add Carousel Slide
          </Button>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-black mb-4">2. Categories Grid</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Title</label>
            <Input value={catState.title || ''} onChange={e => setCatState({...catState, title: e.target.value})} />
          </div>
          <div className="flex items-center pt-6">
             <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={catState.isActive} onChange={e => setCatState({...catState, isActive: e.target.checked})} className="w-4 h-4 text-brand-yellow rounded" />
              <span className="text-sm font-medium">Show Section</span>
            </label>
          </div>
        </div>
      </section>

      {/* 3. BEST SELLERS / PRODUCTS */}
      <section className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-black mb-4">3. Products Grid (Best Sellers)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Section Title</label>
            <Input value={prodState.title || ''} onChange={e => setProdState({...prodState, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">"View All" Link Text</label>
            <Input value={prodState.linkText || ''} onChange={e => setProdState({...prodState, linkText: e.target.value})} placeholder="e.g. Shop All" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">"View All" Link URL</label>
            <Input value={prodState.linkUrl || ''} onChange={e => setProdState({...prodState, linkUrl: e.target.value})} placeholder="e.g. /shop" />
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={prodState.productMode === 'AUTOMATIC_CATEGORY'} onChange={() => setProdState({...prodState, productMode: 'AUTOMATIC_CATEGORY'})} className="text-brand-yellow" />
            <span className="text-sm">Auto (From Category)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={prodState.productMode === 'MANUAL'} onChange={() => setProdState({...prodState, productMode: 'MANUAL'})} className="text-brand-yellow" />
            <span className="text-sm">Manual Selection</span>
          </label>
        </div>

        {prodState.productMode === 'AUTOMATIC_CATEGORY' ? (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Select Category</label>
            <select value={prodState.categoryId || ''} onChange={e => setProdState({...prodState, categoryId: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none">
              <option value="">-- Choose Category --</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search products..." value={productSearch} onChange={e => searchProducts(e.target.value)} className="pl-9" />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />}
            </div>
            
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-40 overflow-y-auto bg-white">
                {searchResults.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50 border-b">
                    <span className="text-sm">{p.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => addManualProduct(p)}><Plus size={14} /></Button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Products ({prodState.manualProducts?.length || 0})</p>
              {prodState.manualProducts?.map((mp) => (
                <div key={mp.product.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                  <span className="text-sm">{mp.product.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeManualProduct(mp.product.id)} className="text-red-500"><Trash2 size={14} /></Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. PROMO BENTO */}
      <section className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-black mb-4">4. Promo Highlight Box</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-700 mb-1">Title</label><Input value={promoState.title || ''} onChange={e => setPromoState({...promoState, title: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Subtitle</label><Input value={promoState.subtitle || ''} onChange={e => setPromoState({...promoState, subtitle: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Button Text</label><Input value={promoState.linkText || ''} onChange={e => setPromoState({...promoState, linkText: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Button Link</label><Input value={promoState.linkUrl || ''} onChange={e => setPromoState({...promoState, linkUrl: e.target.value})} /></div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Promo Image</label>
            <div className="flex items-center gap-4">
              {promoState.imageUrl && <img src={promoState.imageUrl} alt="" className="w-24 h-16 object-cover rounded border" />}
              <Button type="button" variant="outline" className="relative overflow-hidden cursor-pointer flex-1">
                {uploadingPromo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon size={16} className="mr-2" />}
                {uploadingPromo ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={e => handleGenericImageUpload(e.target.files[0], setPromoState, promoState)} disabled={uploadingPromo} className="absolute inset-0 opacity-0 cursor-pointer" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA */}
      <section className="bg-white border border-brand-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-black mb-4">5. Call To Action (Bottom)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-700 mb-1">Title</label><Input value={ctaState.title || ''} onChange={e => setCtaState({...ctaState, title: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Subtitle</label><Input value={ctaState.subtitle || ''} onChange={e => setCtaState({...ctaState, subtitle: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Button Text</label><Input value={ctaState.linkText || ''} onChange={e => setCtaState({...ctaState, linkText: e.target.value})} /></div>
          <div><label className="block text-sm text-gray-700 mb-1">Button Link</label><Input value={ctaState.linkUrl || ''} onChange={e => setCtaState({...ctaState, linkUrl: e.target.value})} /></div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end z-40 lg:ml-64">
        <Button onClick={handleSaveAll} disabled={loading} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-bold px-8 py-6 text-lg w-full md:w-auto">
          {loading ? <Loader2 className="animate-spin mr-2" /> : 'Save Homepage Data'}
        </Button>
      </div>

    </div>
  );
}
