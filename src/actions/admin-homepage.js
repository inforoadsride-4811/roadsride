'use server';

import prisma from '@/lib/db';
import { logAdminActivity } from '@/actions/admin';
import { getSessionAdmin } from '@/actions/auth';
import { unstable_cache, revalidateTag } from 'next/cache';

// Fetch all sections for the admin builder and storefront
export async function getHomepageSections() {
  const fetchCached = unstable_cache(
    async () => {
      try {
        // 1. Fetch base sections
    const rawSections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
    });

    if (!rawSections.length) return { success: true, sections: [] };

    const sectionIds = rawSections.map((s) => s.id);
    const categoryIds = [...new Set(rawSections.map((s) => s.categoryId).filter(Boolean))];

    // 2. Fetch categories and section-product mappings in parallel
    const [categories, manualProducts] = await Promise.all([
      categoryIds.length > 0
        ? prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, slug: true, image: true },
          })
        : Promise.resolve([]),
      prisma.homepageSectionProduct.findMany({
        where: { sectionId: { in: sectionIds } },
        orderBy: { order: 'asc' },
      }),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const productIds = [...new Set(manualProducts.map((mp) => mp.productId))];

    // 3. Fetch products, images, and reviews in parallel
    const [products, images, reviews] = await Promise.all([
      productIds.length > 0
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
              id: true,
              name: true,
              price: true,
              originalPrice: true,
              slug: true,
              stock: true,
              status: true,
            },
          })
        : Promise.resolve([]),
      productIds.length > 0
        ? prisma.productImage.findMany({
            where: { productId: { in: productIds } },
            orderBy: { sortOrder: 'asc' },
          })
        : Promise.resolve([]),
      productIds.length > 0
        ? prisma.productReview.groupBy({
            by: ['productId'],
            where: { productId: { in: productIds } },
            _count: { rating: true },
            _avg: { rating: true },
          })
        : Promise.resolve([]),
    ]);

    // Group images and reviews by product
    const imagesMap = new Map();
    images.forEach((img) => {
      if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
      // Take only first image per product
      if (imagesMap.get(img.productId).length < 1) {
        imagesMap.get(img.productId).push(img);
      }
    });

    const reviewsMap = new Map();
    reviews.forEach((rev) => {
      reviewsMap.set(rev.productId, {
        count: rev._count.rating || 0,
        avg: rev._avg.rating || 0
      });
    });

    const productsMap = new Map(
      products.map((p) => {
        const reviewStats = reviewsMap.get(p.id) || { count: 0, avg: 0 };
        return [
          p.id,
          {
            ...p,
            images: imagesMap.get(p.id) || [],
            reviewCount: reviewStats.count,
            avgRating: reviewStats.avg,
          },
        ];
      })
    );

    // Group manual products by section
    const manualProductsMap = new Map();
    manualProducts.forEach((mp) => {
      if (!manualProductsMap.has(mp.sectionId)) manualProductsMap.set(mp.sectionId, []);
      const p = productsMap.get(mp.productId);
      if (p) {
        manualProductsMap.get(mp.sectionId).push({
          ...mp,
          product: p,
        });
      }
    });

    // 4. Assemble final tree
    const sections = rawSections.map((s) => ({
      ...s,
      category: s.categoryId ? categoryMap.get(s.categoryId) || null : null,
      manualProducts: manualProductsMap.get(s.id) || [],
    }));

        return { success: true, sections };
      } catch (error) {
        console.error('getHomepageSections error:', error);
        return { success: false, error: 'Failed to fetch homepage sections' };
      }
    },
    ['homepage-sections-cache'],
    { tags: ['homepage-sections'], revalidate: 3600 }
  );

  return fetchCached();
}

export async function createHomepageSection(data) {
  try {
    const { productIds, categoryId, category, manualProducts, createdAt, updatedAt, ...sectionData } = data;
    const sanitizedCategoryId = categoryId === '' ? null : categoryId;

    // Determine the next order index
    const lastSection = await prisma.homepageSection.findFirst({
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = lastSection ? lastSection.order + 1 : 0;

    const section = await prisma.homepageSection.create({
      data: {
        ...sectionData,
        categoryId: sanitizedCategoryId,
        order: nextOrder,
        manualProducts: productIds ? {
          create: productIds.map((id, idx) => ({
            productId: id,
            order: idx,
          }))
        } : undefined,
      },
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'created_homepage_section',
        entityType: 'homepage_section',
        entityId: section.id,
        description: `Created homepage section '${section.title || section.type}'`,
      });
    }

    revalidateTag('homepage-sections');
    return { success: true, section };
  } catch (error) {
    console.error('createHomepageSection error:', error);
    return { success: false, error: 'Failed to create homepage section' };
  }
}

export async function updateHomepageSection(id, data) {
  try {
    const { productIds, categoryId, category, manualProducts, createdAt, updatedAt, ...sectionData } = data;
    const sanitizedCategoryId = categoryId === '' ? null : categoryId;

    const section = await prisma.homepageSection.update({
      where: { id },
      data: {
        ...sectionData,
        categoryId: sanitizedCategoryId,
      },
    });

    if (productIds) {
      // Rebuild manual products relations
      await prisma.homepageSectionProduct.deleteMany({
        where: { sectionId: id },
      });
      await prisma.homepageSectionProduct.createMany({
        data: productIds.map((pid, idx) => ({
          sectionId: id,
          productId: pid,
          order: idx,
        })),
      });
    }

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'updated_homepage_section',
        entityType: 'homepage_section',
        entityId: section.id,
        description: `Updated homepage section '${section.title || section.type}'`,
      });
    }

    revalidateTag('homepage-sections');
    return { success: true, section };
  } catch (error) {
    console.error('updateHomepageSection error:', error);
    return { success: false, error: 'Failed to update homepage section' };
  }
}

export async function deleteHomepageSection(id) {
  try {
    const section = await prisma.homepageSection.findUnique({ where: { id } });
    if (!section) return { success: false, error: 'Not found' };

    await prisma.homepageSection.delete({ where: { id } });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'deleted_homepage_section',
        entityType: 'homepage_section',
        entityId: id,
        description: `Deleted homepage section '${section.title || section.type}'`,
      });
    }

    revalidateTag('homepage-sections');
    return { success: true };
  } catch (error) {
    console.error('deleteHomepageSection error:', error);
    return { success: false, error: 'Failed to delete homepage section' };
  }
}

export async function reorderHomepageSections(orderedIds) {
  try {
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.homepageSection.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'reordered_homepage_sections',
        entityType: 'homepage_section',
        entityId: 'all',
        description: `Reordered homepage sections`,
      });
    }

    revalidateTag('homepage-sections');
    return { success: true };
  } catch (error) {
    console.error('reorderHomepageSections error:', error);
    return { success: false, error: 'Failed to reorder homepage sections' };
  }
}

// Helper to fetch active products for manual selection
export async function getProductsForManualSelection(search = '') {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        name: { contains: search, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      take: 20,
    });
    return { success: true, products };
  } catch (error) {
    console.error('getProductsForManualSelection error:', error);
    return { success: false, error: 'Failed to fetch products for selection' };
  }
}
