'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Get FAQs for a product
export async function getProductFAQs(productId) {
  try {
    const faqs = await prisma.productFAQ.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, faqs };
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return { success: false, error: 'Failed to fetch FAQs' };
  }
}

// Save (create or update) a FAQ
export async function saveProductFAQ(productId, data) {
  try {
    const { id, question, answer, sortOrder = 0 } = data;
    
    let faq;
    if (id) {
      faq = await prisma.productFAQ.update({
        where: { id },
        data: { question, answer, sortOrder },
      });
    } else {
      faq = await prisma.productFAQ.create({
        data: {
          productId,
          question,
          answer,
          sortOrder,
        },
      });
    }
    
    revalidatePath('/admin/products');
    revalidatePath(`/product/[slug]`); // This might not trigger properly without the actual slug, but standard practice in this setup
    return { success: true, faq };
  } catch (error) {
    console.error('Failed to save FAQ:', error);
    return { success: false, error: 'Failed to save FAQ' };
  }
}

// Delete a FAQ
export async function deleteProductFAQ(id) {
  try {
    await prisma.productFAQ.delete({
      where: { id },
    });
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete FAQ:', error);
    return { success: false, error: 'Failed to delete FAQ' };
  }
}
