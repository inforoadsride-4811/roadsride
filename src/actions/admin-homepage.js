'use server';

import prisma from '@/lib/db';
import { logAdminActivity } from '@/actions/admin';
import { getSessionAdmin } from '@/actions/auth';

// Fetch all sections for the admin builder and storefront
export async function getHomepageSections() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        category: {
          select: { id: true, name: true, slug: true, image: true },
        },
        manualProducts: {
          orderBy: { order: 'asc' },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                originalPrice: true,
                slug: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                stock: true,
                status: true,
                reviews: {
                  select: { rating: true },
                },
              },
            },
          },
        },
      },
    });

    return { success: true, sections };
  } catch (error) {
    console.error('getHomepageSections error:', error);
    return { success: false, error: 'Failed to fetch homepage sections' };
  }
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
