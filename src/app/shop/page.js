import { getShopProducts, getShopFilters } from '@/actions/shop';
import ShopPageClient from '@/components/shop/ShopPageClient';

export const metadata = {
  title: 'Shop All Products | RoadsRide',
  description: 'Browse our complete collection of premium car and bike accessories, cleaning products, and detailing essentials.',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }) {
  const resolvedParams = await searchParams;

  // Extract all query params
  const {
    page,
    q,
    categorySlug,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort
  } = resolvedParams;

  // Fetch data in parallel
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
        Failed to load shop data. Please try again later.
      </div>
    );
  }

  // Pass current filters back so client knows active state
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
