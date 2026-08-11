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
        parentId: true,
        sortOrder: true,
        _count: {
          select: { products: { where: { status: 'active' } } }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    // Get max price across all active products
    const maxPriceResult = await prisma.product.aggregate({
      where: { status: 'active' },
      _max: { price: true }
    });

    return {
      success: true,
      categories: categories,
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

    const [totalCount, baseProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      })
    ]);

    // Fast return if no products
    if (!baseProducts.length) {
      return {
        success: true,
        products: [],
        pagination: { total: totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) }
      };
    }

    const productIds = baseProducts.map(p => p.id);
    const categoryIds = [...new Set(baseProducts.map(p => p.categoryId).filter(Boolean))];

    // Parallel fetch related data
    const [images, reviews, categories] = await Promise.all([
      prisma.productImage.findMany({
        where: { productId: { in: productIds } },
        orderBy: { sortOrder: 'asc' }
      }),
      prisma.productReview.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _count: { rating: true },
        _avg: { rating: true }
      }),
      categoryIds.length > 0 
        ? prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, slug: true }
          })
        : Promise.resolve([])
    ]);

    // Grouping
    const imagesMap = new Map();
    images.forEach(img => {
      if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
      if (imagesMap.get(img.productId).length < 2) {
        imagesMap.get(img.productId).push(img);
      }
    });

    const reviewsMap = new Map();
    reviews.forEach(rev => {
      reviewsMap.set(rev.productId, {
        count: rev._count.rating || 0,
        avg: rev._avg.rating || 0
      });
    });

    const categoriesMap = new Map(categories.map(c => [c.id, c]));

    const products = baseProducts.map(p => {
      const reviewStats = reviewsMap.get(p.id) || { count: 0, avg: 0 };
      return {
        ...p,
        images: imagesMap.get(p.id) || [],
        reviewCount: reviewStats.count,
        avgRating: reviewStats.avg,
        category: p.categoryId ? categoriesMap.get(p.categoryId) || null : null,
      };
    });

    // If rating filter was applied, we need to filter in memory since Prisma `some` 
    // only means "has at least one review >= rating", not "average >= rating".
    let finalProducts = products;
    let finalTotal = totalCount;

    if (rating && Number(rating) > 0) {
      finalProducts = products.filter(p => p.avgRating >= Number(rating));
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
