'use server';

import prisma from '@/lib/db';

export async function searchPublicProducts(query) {
  if (!query) return { success: true, products: [] };

  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      take: 6, // Limit dropdown results
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        originalPrice: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
        category: {
          select: { name: true }
        }
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error('searchPublicProducts error:', error);
    return { success: false, error: 'Failed to search products' };
  }
}
