'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Capture or update a checkout draft
export async function saveCheckoutDraft(data) {
  try {
    const { id, email, phone, firstName, lastName, address, apartment, city, state, pincode, cartItems, subtotal, shipping, total } = data;

    // Validate we have at least some cart items to save
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: 'No items in cart' };
    }

    if (id) {
      // Update existing draft
      const draft = await prisma.checkoutDraft.update({
        where: { id },
        data: {
          email,
          phone,
          firstName,
          lastName,
          address,
          apartment,
          city,
          state,
          pincode,
          cartItems,
          subtotal,
          shipping,
          total,
          updatedAt: new Date()
        }
      });
      return { success: true, draftId: draft.id };
    } else {
      // Create new draft
      const draft = await prisma.checkoutDraft.create({
        data: {
          email,
          phone,
          firstName,
          lastName,
          address,
          apartment,
          city,
          state,
          pincode,
          cartItems,
          subtotal,
          shipping,
          total,
          status: 'draft'
        }
      });
      return { success: true, draftId: draft.id };
    }
  } catch (error) {
    console.error('Save checkout draft error:', error);
    return { success: false, error: error.message };
  }
}

// Convert draft to completed (called when order is successfully placed)
export async function completeCheckoutDraft(id) {
  try {
    if (!id) return { success: false };

    await prisma.checkoutDraft.update({
      where: { id },
      data: { status: 'completed', updatedAt: new Date() }
    });
    return { success: true };
  } catch (error) {
    console.error('Complete checkout draft error:', error);
    return { success: false, error: error.message };
  }
}

// Admin: Get all drafts
export async function getAllDrafts(options = {}) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      status = 'all' // all, draft, completed
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [drafts, total] = await Promise.all([
      prisma.checkoutDraft.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.checkoutDraft.count({ where })
    ]);

    return {
      success: true,
      drafts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    };
  } catch (error) {
    console.error('Get all drafts error:', error);
    return { success: false, error: error.message };
  }
}

// Admin: Delete a draft
export async function deleteDraft(id) {
  try {
    await prisma.checkoutDraft.delete({ where: { id } });
    revalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Delete draft error:', error);
    return { success: false, error: error.message };
  }
}

// Admin: Bulk delete drafts
export async function bulkDeleteDrafts(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { success: false, error: 'No IDs provided' };
    }
    
    if (ids.length > 10) {
      return { success: false, error: 'Cannot delete more than 10 records at once' };
    }

    await prisma.checkoutDraft.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    revalidatePath('/admin/drafts');
    return { success: true };
  } catch (error) {
    console.error('Bulk delete drafts error:', error);
    return { success: false, error: error.message };
  }
}
