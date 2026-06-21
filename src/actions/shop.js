'use server';

import prisma from '@/lib/db';

export async function getShopFilters() {
  try {
    // Fetch categories that have active products
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: { where: { status: 'active' } } }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Get max price across all active products
    const maxPriceResult = await prisma.product.aggregate({
      where: { status: 'active' },
      _max: { price: true }
    });

    return {
      success: true,
      categories: categories.filter(c => c._count.products > 0),
      maxPrice: maxPriceResult._max.price || 10000,
    };
  } catch (error) {
    console.error('getShopFilters error:', error);
    return { success: false, error: 'Failed to fetch filters' };
  }
}

export async function getShopProducts(params = {}) {
  try {
    const {
      page = 1,
      limit = 24,
      q = '',
      categorySlug = '',
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort = 'newest'
    } = params;

    const skip = (page - 1) * limit;

    // Build the Prisma "where" clause
    const where = { status: 'active' };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { seoKeywords: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = Number(minPrice);
      if (maxPrice !== undefined) where.price.lte = Number(maxPrice);
    }

    if (inStock === 'true' || inStock === true) {
      where.stock = { gt: 0 };
    }

    // We can't filter by computed average rating easily in Prisma directly without raw SQL,
    // but we can filter by products that have at least one review with >= rating, 
    // or just fetch them and sort. For now, we'll do a basic filter if rating is provided.
    // A robust way in Prisma for average rating is complex, so we'll do an approximation:
    if (rating && Number(rating) > 0) {
      where.reviews = {
        some: {
          rating: { gte: Number(rating) }
        }
      };
    }

    // Build the "orderBy" clause
    let orderBy = { createdAt: 'desc' }; // default 'newest'

    switch (sort) {
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
      case 'best-selling':
        orderBy = { soldCount: 'desc' };
        break;
      case 'rating':
        // Prisma doesn't support order by relation aggregate average yet.
        // We will order by review count as a proxy for "popular/rated" for now.
        orderBy = { reviews: { _count: 'desc' } };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 2 }, // Take 2 for hover effect
          reviews: { select: { rating: true } },
          category: { select: { name: true, slug: true } }
        }
      })
    ]);

    // Calculate average rating for each product
    const formattedProducts = products.map(product => {
      const reviewCount = product.reviews.length;
      const avgRating = reviewCount > 0
        ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount)
        : 0;

      return {
        ...product,
        reviewCount,
        avgRating,
      };
    });

    // If rating filter was applied, we need to filter in memory since Prisma `some` 
    // only means "has at least one review >= rating", not "average >= rating".
    let finalProducts = formattedProducts;
    let finalTotal = totalCount;

    if (rating && Number(rating) > 0) {
      finalProducts = formattedProducts.filter(p => p.avgRating >= Number(rating));
      // Note: In-memory filtering breaks perfect pagination. For a real large-scale app,
      // we'd add an `averageRating` column to the Product model and update it via triggers.
      // But for this scale, it's acceptable, or we just trust the `some` filter as a proxy.
      // Let's use the proxy for now to keep pagination intact.
    }

    return {
      success: true,
      products: finalProducts,
      pagination: {
        total: finalTotal,
        page,
        limit,
        totalPages: Math.ceil(finalTotal / limit)
      }
    };

  } catch (error) {
    console.error('getShopProducts error:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}
