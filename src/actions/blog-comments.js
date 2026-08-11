'use server';

import prisma from '@/lib/db';
import { getSessionCustomer } from '@/actions/customer-auth';
import { revalidateTag } from 'next/cache';

export async function submitBlogComment(blogId, data) {
  try {
    const { content, author, rating, images } = data;
    
    if (!content || !author) {
      return { success: false, error: 'Name and comment are required' };
    }

    const session = await getSessionCustomer();
    const customerId = session.success ? session.customer.id : null;

    const comment = await prisma.blogComment.create({
      data: {
        blogId,
        customerId,
        author,
        rating: rating || null,
        content,
        images: images || null,
        approved: false, // All comments require admin approval
      }
    });

    // We don't revalidate the blog path immediately since the comment is pending approval.
    // If we wanted to show "pending" to the user, we could, but typical behavior is it just says "submitted for review".

    return { success: true, message: 'Your comment has been submitted and is pending approval.' };
  } catch (error) {
    console.error('submitBlogComment error:', error);
    return { success: false, error: 'Failed to submit comment. Please try again later.' };
  }
}

export async function getApprovedBlogComments(blogId) {
  try {
    const comments = await prisma.blogComment.findMany({
      where: {
        blogId,
        approved: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        author: true,
        content: true,
        rating: true,
        images: true,
        createdAt: true,
        adminReply: true,
        adminReplyAt: true,
        customer: {
          select: {
            avatar: true
          }
        }
      }
    });

    return { success: true, comments };
  } catch (error) {
    console.error('getApprovedBlogComments error:', error);
    return { success: false, error: 'Failed to load comments' };
  }
}
