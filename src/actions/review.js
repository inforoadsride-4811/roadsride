'use server';

import prisma from '@/lib/db';
import { getSessionCustomer } from './customer-auth';

// User Action: Submit Review
export async function submitReview(data) {
  try {
    const { customer } = await getSessionCustomer();
    if (!customer) {
      return { success: false, error: 'You must be logged in to submit a review.' };
    }

    const { productId, rating, title, content, images } = data;

    if (!productId || !rating || !content) {
      return { success: false, error: 'Missing required fields.' };
    }

    // Check if verified purchase
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          customerId: customer.id,
          orderStatus: { in: ['delivered', 'completed', 'shipped', 'confirmed'] }
        }
      }
    });

    const isVerified = !!hasPurchased;

    const review = await prisma.productReview.create({
      data: {
        productId,
        customerId: customer.id,
        author: customer.name,
        rating: parseInt(rating),
        title,
        content,
        images: images || [],
        verified: isVerified,
        approved: false, // Default to requiring admin approval
      }
    });

    return { success: true, review };
  } catch (error) {
    console.error('Submit review error:', error);
    return { success: false, error: 'Failed to submit review. Please try again.' };
  }
}

// User Action: Toggle review helpful (like/unlike)
export async function toggleReviewHelpful(reviewId, isLiked) {
  try {
    await prisma.productReview.update({
      where: { id: reviewId },
      data: { helpfulCount: isLiked ? { decrement: 1 } : { increment: 1 } }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update helpful.' };
  }
}

// Public Query: Get approved reviews + current user's own pending reviews
export async function getProductReviews(productId, { page = 1, limit = 5 } = {}) {
  try {
    const skip = (page - 1) * limit;

    // Get the current user (if logged in)
    let currentCustomerId = null;
    try {
      const { customer } = await getSessionCustomer();
      if (customer) currentCustomerId = customer.id;
    } catch {}

    // Build query: approved reviews + user's own pending (not rejected)
    const where = {
      productId,
      OR: [
        { approved: true },
        ...(currentCustomerId ? [{ customerId: currentCustomerId, approved: false, NOT: undefined }] : []),
      ],
    };

    // For user's own pending: separate query to not mess with pagination
    let userPendingReviews = [];
    if (currentCustomerId) {
      userPendingReviews = await prisma.productReview.findMany({
        where: {
          productId,
          customerId: currentCustomerId,
          approved: false,
        },
        include: { customer: { select: { avatar: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId, approved: true },
        include: { customer: { select: { avatar: true, name: true } } },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.productReview.count({
        where: { productId, approved: true }
      })
    ]);

    // Format reviews
    const formatReview = (r, isPending = false) => ({
      id: r.id,
      author: r.customer?.name || r.author,
      avatar: r.customer?.avatar || null,
      rating: r.rating,
      title: r.title,
      content: r.content,
      images: r.images || (r.image ? [r.image] : []),
      verified: r.verified,
      helpfulCount: r.helpfulCount,
      isFeatured: r.isFeatured,
      adminReply: r.adminReply || null,
      adminReplyAt: r.adminReplyAt ? r.adminReplyAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null,
      isPending,
      isOwnReview: r.customerId === currentCustomerId,
      date: r.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });

    // Combine: user's pending first, then approved
    const pendingFormatted = userPendingReviews.map(r => formatReview(r, true));
    const approvedFormatted = reviews.map(r => formatReview(r, false));
    // Remove duplicates (if user's review got approved, don't show twice)
    const pendingIds = new Set(pendingFormatted.map(r => r.id));
    const combined = [...pendingFormatted, ...approvedFormatted.filter(r => !pendingIds.has(r.id))];

    return {
      success: true,
      reviews: combined,
      pagination: {
        page,
        limit,
        total: total + userPendingReviews.length,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Get reviews error:', error);
    return { success: false, reviews: [], pagination: {} };
  }
}

// Admin Query: Get all reviews (Paginated)
export async function getAdminReviews({ page = 1, limit = 20, search = '', status = 'all' } = {}) {
  try {
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { author: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        include: { 
          product: { select: { name: true, slug: true, images: { take: 1 } } },
          customer: { select: { email: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productReview.count({ where })
    ]);

    return {
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Get admin reviews error:', error);
    return { success: false, reviews: [], pagination: {} };
  }
}

// Admin Action: Update Review Status
export async function updateReviewStatus(id, action) {
  try {
    const data = {};
    if (action === 'approve') data.approved = true;
    if (action === 'reject' || action === 'hide') data.approved = false;
    if (action === 'feature') data.isFeatured = true;
    if (action === 'unfeature') data.isFeatured = false;

    if (action === 'delete') {
      await prisma.productReview.delete({ where: { id } });
      return { success: true };
    }

    await prisma.productReview.update({
      where: { id },
      data
    });

    return { success: true };
  } catch (error) {
    console.error('Update review error:', error);
    return { success: false, error: 'Failed to update review status.' };
  }
}

// Admin Action: Edit Review (title, content, rating)
export async function editReview(id, { title, content, rating }) {
  try {
    const data = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (rating !== undefined) data.rating = parseInt(rating);

    await prisma.productReview.update({
      where: { id },
      data,
    });

    return { success: true };
  } catch (error) {
    console.error('Edit review error:', error);
    return { success: false, error: 'Failed to edit review.' };
  }
}

// Admin Action: Reply to Review
export async function replyToReview(id, reply) {
  try {
    await prisma.productReview.update({
      where: { id },
      data: {
        adminReply: reply || null,
        adminReplyAt: reply ? new Date() : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Reply to review error:', error);
    return { success: false, error: 'Failed to reply to review.' };
  }
}
