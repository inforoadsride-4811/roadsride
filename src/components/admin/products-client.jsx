'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye, Package, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, getOrderStatusVariant } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { deleteProduct } from '@/actions/admin-products';
import { bulkDeleteProducts } from '@/actions/admin';
import { formatPrice } from '@/lib/product';
import { useToast } from '@/components/ui/toast';
import { ProductFaqModal } from './product-faq-modal';

const statusOptions = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

function getStatusVariant(status) {
  switch (status) {
    case 'active': return 'success';
    case 'draft': return 'warning';
    case 'archived': return 'default';
    default: return 'default';
  }
}

export default function ProductsClient({ initialProducts, pagination, initialSearch, initialStatus }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);
  const [deleting, setDeleting] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [faqModalProduct, setFaqModalProduct] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleStatusFilter = (val) => {
    setStatus(val);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (val) params.set('status', val);
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    setDeleting(id);
    const { success } = await deleteProduct(id);
    if (success) {
      addToast({ title: 'Product deleted', message: `"${name}" has been deleted.`, type: 'success' });
      router.refresh();
    } else {
      addToast({ title: 'Error', message: 'Failed to delete product', type: 'error' });
    }
    setDeleting(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(initialProducts.map(p => p.id));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products? This cannot be undone.`)) return;

    setIsDeletingBulk(true);
    try {
      const result = await bulkDeleteProducts(selectedIds);
      if (result.success) {
        addToast({ title: 'Success', message: `Successfully deleted ${selectedIds.length} products`, type: 'success' });
        setSelectedIds([]);
        router.refresh();
      } else {
        addToast({ title: 'Error', message: result.error || 'Failed to delete products', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsDeletingBulk(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} total products</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={16} className="mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border border-brand-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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
          <div className="flex-1 flex items-center bg-gray-50 border border-brand-border rounded-lg px-3 focus-within:border-brand-yellow focus-within:ring-1 focus-within:ring-brand-yellow/30 transition-all">
            <Search size={16} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full py-2 text-brand-black placeholder:text-gray-400"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">Search</Button>
        </form>

        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                status === opt.value
                  ? 'bg-brand-yellow text-brand-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
        {initialProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-brand-black mb-2">No products found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by creating your first product.</p>
            <Link href="/admin/products/new">
              <Button><Plus size={16} className="mr-2" /> Add Product</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={initialProducts.length > 0 && selectedIds.length === initialProducts.length}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialProducts.map((product) => (
                <TableRow key={product.id} className={selectedIds.includes(product.id) ? 'bg-blue-50/50' : ''}>
                  <TableCell className="w-[50px] text-center" onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(product.id)}
                      onChange={(e) => handleSelectOne(e, product.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-lg border border-brand-border bg-gray-50 overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.src ? (
                          <Image src={product.images[0].src} alt={product.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-black text-sm line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">/{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(product.status)} className="capitalize">
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-brand-black">{formatPrice(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${product.stock === 0 ? 'text-brand-danger' : 'text-brand-black'}`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {product.category?.name || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setFaqModalProduct(product)}
                        className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" 
                        title="Manage FAQs"
                      >
                        <HelpCircle size={16} />
                      </button>
                      <Link href={`/product/${product.slug}`} target="_blank">
                        <button className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="View">
                          <Eye size={16} />
                        </button>
                      </Link>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <button className="p-2 text-gray-400 hover:text-brand-yellow hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <Edit size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deleting === product.id}
                        className="p-2 text-gray-400 hover:text-brand-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-gray-50">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('page', pagination.page - 1);
                  if (search) params.set('search', search);
                  if (status) params.set('status', status);
                  router.push(`/admin/products?${params.toString()}`);
                }}
              >
                <ChevronLeft size={14} className="mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('page', pagination.page + 1);
                  if (search) params.set('search', search);
                  if (status) params.set('status', status);
                  router.push(`/admin/products?${params.toString()}`);
                }}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProductFaqModal 
        isOpen={!!faqModalProduct} 
        onClose={() => setFaqModalProduct(null)} 
        product={faqModalProduct} 
      />
    </div>
  );
}
