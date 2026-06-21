import { getShopProducts, getShopFilters } from '@/actions/shop';
import ShopPageClient from '@/components/shop/ShopPageClient';

export const metadata = {
  title: 'Search Products | RoadsRide',
  description: 'Search for premium automotive accessories and care products.',
};

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  
  const {
    q,
    page,
    categorySlug,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort
  } = resolvedParams;

  const [productsRes, filtersRes] = await Promise.all([
    getShopProducts({
      page: Number(page) || 1,
      q,
      categorySlug,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort
    }),
    getShopFilters()
  ]);

  if (!productsRes.success || !filtersRes.success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-red-500">
        Failed to load search data. Please try again later.
      </div>
    );
  }

  const initialFilters = {
    q: q || '',
    categorySlug: categorySlug || '',
    minPrice: minPrice || '',
    maxPrice: maxPrice || '',
    rating: rating || '',
    inStock: inStock || '',
    sort: sort || 'newest',
  };

  return (
    <ShopPageClient 
      initialProducts={productsRes.products}
      pagination={productsRes.pagination}
      filterMetadata={{
        categories: filtersRes.categories,
        maxPrice: filtersRes.maxPrice
      }}
      initialFilters={initialFilters}
    />
  );
}
