'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProductOffers(productId) {
  try {
    const offers = await prisma.productOffer.findMany({
      where: { productId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return { success: true, offers };
  } catch (error) {
    console.error('Error fetching product offers:', error);
    return { success: false, error: 'Failed to fetch offers' };
  }
}

export async function saveProductOffers(productId, offers) {
  try {
    await prisma.$transaction(async (tx) => {
      const existingDbOffers = await tx.productOffer.findMany({ where: { productId }, select: { id: true } });
      const existingDbIds = existingDbOffers.map(o => o.id);
      
      const incomingOffers = offers || [];
      const incomingIds = incomingOffers.map(o => o.id).filter(Boolean);

      const idsToDelete = existingDbIds.filter(id => !incomingIds.includes(id));
      if (idsToDelete.length > 0) {
        await tx.productOffer.deleteMany({ where: { id: { in: idsToDelete } } });
      }

      await Promise.all(incomingOffers.map((o, i) => {
        const data = {
          title: o.title,
          subtitle: o.subtitle || null,
          badgeText: o.badgeText || null,
          ctaText: o.ctaText || null,
          expiredMessage: o.expiredMessage || null,
          bgTheme: o.bgTheme || 'gradient-fire',
          bgColor: o.bgColor || null,
          bgGradient: o.bgGradient || null,
          bannerImage: o.bannerImage || null,
          startDate: new Date(o.startDate),
          endDate: new Date(o.endDate),
          isActive: o.isActive !== false,
          showCountdown: o.showCountdown !== false,
          priority: parseInt(o.priority) || 0,
          position: o.position || 'above-packs',
        };

        if (o.id) {
          return tx.productOffer.update({ where: { id: o.id }, data });
        } else {
          return tx.productOffer.create({ data: { ...data, productId } });
        }
      }));
    }, {
      maxWait: 10000,
      timeout: 30000
    });
    
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath(`/product/[slug]`, 'page');
    return { success: true };
  } catch (error) {
    console.error('saveProductOffers error:', error);
    return { success: false, error: 'Failed to save offers' };
  }
}
