import { getShopProducts, getShopFilters } from '@/actions/shop';
import ShopPageClient from '@/components/shop/ShopPageClient';
import prisma from '@/lib/db';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const category = await prisma.category.findUnique({
    where: { slug }
  });

  return {
    title: category ? `${category.name} | RoadsRide` : 'Category | RoadsRide',
    description: category?.description || 'Browse our premium collection of products.',
  };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const categorySlug = resolvedParams.slug;

  const {
    page,
    q,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort
  } = resolvedSearchParams;

  const [productsRes, filtersRes] = await Promise.all([
    getShopProducts({
      page: Number(page) || 1,
      q,
      categorySlug, // Overridden by route param
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
        Failed to load category data. Please try again later.
      </div>
    );
  }

  const initialFilters = {
    q: q || '',
    categorySlug,
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
