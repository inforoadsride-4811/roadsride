'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSessionCustomer } from './customer-auth';

/**
 * Fetch answered Q&As + current user's own pending questions
 */
export async function getProductQA(productId) {
  try {
    // Get current user
    let currentCustomerEmail = null;
    try {
      const { customer } = await getSessionCustomer();
      if (customer) currentCustomerEmail = customer.email;
    } catch {}

    // Get answered Q&As
    const answeredQAs = await prisma.productQA.findMany({
      where: {
        productId,
        status: 'answered',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get user's own pending questions (matched by author name/email)
    let userPendingQAs = [];
    if (currentCustomerEmail) {
      userPendingQAs = await prisma.productQA.findMany({
        where: {
          productId,
          status: 'pending',
          author: { not: 'Admin' },
        },
        orderBy: { createdAt: 'desc' },
      });
      // Filter to only those that match the current user's name
      const { customer } = await getSessionCustomer();
      if (customer) {
        userPendingQAs = userPendingQAs.filter(q => q.author === customer.name);
      }
    }

    // Mark pending ones
    const combined = [
      ...userPendingQAs.map(q => ({ ...q, isPending: true })),
      ...answeredQAs.map(q => ({ ...q, isPending: false })),
    ];

    return { success: true, qas: combined };
  } catch (error) {
    console.error('getProductQA error:', error);
    return { success: false, error: 'Failed to fetch Q&As' };
  }
}

/**
 * Customer asks a new question
 */
export async function askQuestion(productId, data) {
  try {
    if (!data.question || !data.author) {
      return { success: false, error: 'Question and Author name are required' };
    }

    const newQA = await prisma.productQA.create({
      data: {
        productId,
        question: data.question,
        author: data.author,
        status: 'pending',
      },
    });

    revalidatePath(`/admin/qa`);
    
    return { success: true, qa: newQA };
  } catch (error) {
    console.error('askQuestion error:', error);
    return { success: false, error: 'Failed to submit question' };
  }
}

/**
 * Admin: Get all Q&As (pending, answered, rejected)
 */
export async function getAdminQAs() {
  try {
    const qas = await prisma.productQA.findMany({
      include: {
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const pendingCount = await prisma.productQA.count({
      where: { status: 'pending' },
    });

    return { success: true, qas, pendingCount };
  } catch (error) {
    console.error('getAdminQAs error:', error);
    return { success: false, error: 'Failed to fetch Q&As' };
  }
}

/**
 * Admin: Get only the pending Q&A count for the sidebar badge
 */
export async function getPendingQACount() {
  try {
    const count = await prisma.productQA.count({
      where: { status: 'pending' },
    });
    return { success: true, count };
  } catch (error) {
    return { success: false, count: 0 };
  }
}

/**
 * Admin: Answer a pending question
 */
export async function answerQuestion(qaId, answer) {
  try {
    if (!answer) {
      return { success: false, error: 'Answer is required' };
    }

    const qa = await prisma.productQA.update({
      where: { id: qaId },
      data: {
        answer,
        status: 'answered',
      },
      include: {
        product: { select: { slug: true } }
      }
    });

    revalidatePath(`/product/${qa.product.slug}`);
    revalidatePath('/admin/qa');

    return { success: true, qa };
  } catch (error) {
    console.error('answerQuestion error:', error);
    return { success: false, error: 'Failed to answer question' };
  }
}

/**
 * Admin: Reject a question
 */
export async function rejectQuestion(qaId) {
  try {
    const qa = await prisma.productQA.update({
      where: { id: qaId },
      data: {
        status: 'rejected',
      },
    });

    revalidatePath('/admin/qa');

    return { success: true, qa };
  } catch (error) {
    console.error('rejectQuestion error:', error);
    return { success: false, error: 'Failed to reject question' };
  }
}

/**
 * Admin: Delete a question
 */
export async function deleteQA(qaId) {
  try {
    const qa = await prisma.productQA.findUnique({
      where: { id: qaId },
      include: { product: { select: { slug: true } } }
    });

    if (!qa) return { success: false, error: 'Q&A not found' };

    await prisma.productQA.delete({
      where: { id: qaId },
    });

    revalidatePath(`/product/${qa.product.slug}`);
    revalidatePath('/admin/qa');

    return { success: true };
  } catch (error) {
    console.error('deleteQA error:', error);
    return { success: false, error: 'Failed to delete Q&A' };
  }
}

/**
 * Admin: Create a dummy/seeded Q&A directly
 */
export async function createDummyQA(productId, data) {
  try {
    if (!data.question || !data.answer) {
      return { success: false, error: 'Question and Answer are required' };
    }

    const qa = await prisma.productQA.create({
      data: {
        productId,
        question: data.question,
        answer: data.answer,
        author: data.author || 'Admin',
        status: 'answered',
        isDummy: true,
      },
      include: { product: { select: { slug: true } } }
    });

    revalidatePath(`/product/${qa.product.slug}`);
    revalidatePath('/admin/qa');

    return { success: true, qa };
  } catch (error) {
    console.error('createDummyQA error:', error);
    return { success: false, error: 'Failed to create dummy Q&A' };
  }
}
