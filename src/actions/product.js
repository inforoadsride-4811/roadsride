'use server';

import prisma from '@/lib/db';
import { unstable_cache } from 'next/cache';

const getProductBySlugQuery = async (slug) => {
  return unstable_cache(
    async () => {
  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product) return null;

  const [images, variants, features, specs, reviews, qa, category] = await Promise.all([
    prisma.productImage.findMany({ where: { productId: product.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productVariant.findMany({ where: { productId: product.id, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.productFeature.findMany({ where: { productId: product.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productSpec.findMany({ where: { productId: product.id }, orderBy: { sortOrder: 'asc' } }),
    prisma.productReview.findMany({ 
      where: { productId: product.id, approved: true }, 
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    }),
    prisma.productQA.findMany({ where: { productId: product.id, status: 'answered' }, orderBy: { createdAt: 'desc' } }),
    product.categoryId ? prisma.category.findUnique({ where: { id: product.categoryId } }) : null
  ]);

  return {
    ...product,
    images,
    variants,
    features,
    specs,
    reviews,
    qa,
      category
    };
  },
  [`product-${slug}`],
  {
    revalidate: 60,
    tags: [`product-${slug}`, 'product']
  }
  )();
};

/**
 * Fetch a product by slug with all relations.
 * Returns the same shape expected by the current UI components.
 */
export async function getProductBySlug(slug) {
  try {
    const product = await getProductBySlugQuery(slug);

    if (!product) return { success: false, error: 'Product not found' };

    // Transform to the shape expected by UI components (backwards compatible)
    const transformed = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortName: product.shortName || product.name,
      originalPrice: product.originalPrice,
      price: product.price,
      discount: product.discount,
      currency: product.currency,
      stock: product.stock,
      soldCount: product.soldCount,
      soldPeriod: product.soldPeriod,
      status: product.status,
      isFeatured: product.isFeatured,
      store: {
        name: 'RoadsRide',
        rating: 4.8,
        reviewCount: product.reviews.length,
      },
      // Transform variants back to "packs" shape
      packs: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        originalPrice: v.originalPrice,
        isBestSeller: v.isBestSeller,
        images: v.images || product.images.map((img) => ({ id: img.id, src: img.src, alt: img.alt })),
      })),
      features: product.features.map((f) => ({
        bold: f.bold,
        text: f.text,
      })),
      specs: product.specs.map((s) => ({
        label: s.label,
        value: s.value,
      })),
      qas: product.qa.map((q) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
        author: q.author,
        date: new Date(q.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      })),
      breadcrumb: product.breadcrumb || [
        { name: 'Home', href: '/' },
      ],
      reviews: product.reviews.map((r) => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        content: r.content,
        image: r.image,
        images: r.images,
        avatar: r.customer?.avatar || null,
        verified: r.verified,
        date: new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      })),
      additionalInfo: product.additionalInfo || {},
      description: product.description || '',
      descriptionData: product.descriptionData || {},
      // SEO
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords,
      ogImage: product.ogImage,
      canonicalUrl: product.canonicalUrl,
    };

    return { success: true, product: transformed };
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return { success: false, error: 'Failed to fetch product' };
  }
}

/**
 * Fetch featured products for the homepage
 */
export async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, status: 'active' },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { orderBy: { sortOrder: 'asc' }, where: { isActive: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, products };
  } catch (error) {
    console.error('getFeaturedProducts error:', error);
    return { success: false, products: [] };
  }
}

/**
 * Fetch all active products (paginated)
 */
export async function getProducts({ page = 1, limit = 12, categorySlug, search } = {}) {
  try {
    const where = { status: 'active' };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: { orderBy: { sortOrder: 'asc' }, where: { isActive: true }, take: 1 },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('getProducts error:', error);
    return { success: false, products: [], pagination: {} };
  }
}
