'use server';

import prisma from '@/lib/db';
import { logAdminActivity } from '@/actions/admin';
import { getSessionAdmin } from '@/actions/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function getAdminBlogComments({ page = 1, limit = 20, search = '', status = 'all' } = {}) {
  try {
    const where = {};
    
    if (status === 'approved') where.approved = true;
    else if (status === 'pending') where.approved = false;

    if (search) {
      where.OR = [
        { author: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { blog: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          blog: { select: { title: true, slug: true } },
          customer: { select: { email: true, name: true } }
        }
      }),
      prisma.blogComment.count({ where }),
    ]);

    return {
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('getAdminBlogComments error:', error);
    return { success: false, error: 'Failed to fetch blog comments' };
  }
}

export async function toggleBlogCommentStatus(id) {
  try {
    const comment = await prisma.blogComment.findUnique({ where: { id }, include: { blog: true } });
    if (!comment) return { success: false, error: 'Comment not found' };

    const newStatus = !comment.approved;
    await prisma.blogComment.update({
      where: { id },
      data: { approved: newStatus }
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: newStatus ? 'approved_blog_comment' : 'rejected_blog_comment',
        entityType: 'blog_comment',
        entityId: id,
        description: `${newStatus ? 'Approved' : 'Unapproved'} blog comment on '${comment.blog.title}'`,
      });
    }

    revalidatePath('/admin/reviews', 'page');
    revalidatePath(`/blog/${comment.blog.slug}`, 'page');
    revalidateTag('blog-comments');

    return { success: true, approved: newStatus };
  } catch (error) {
    console.error('toggleBlogCommentStatus error:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function deleteBlogComment(id) {
  try {
    const comment = await prisma.blogComment.findUnique({ where: { id }, include: { blog: true } });
    if (!comment) return { success: false, error: 'Comment not found' };

    await prisma.blogComment.delete({ where: { id } });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'deleted_blog_comment',
        entityType: 'blog_comment',
        entityId: id,
        description: `Deleted blog comment on '${comment.blog.title}'`,
      });
    }

    revalidatePath('/admin/reviews', 'page');
    revalidatePath(`/blog/${comment.blog.slug}`, 'page');
    revalidateTag('blog-comments');

    return { success: true };
  } catch (error) {
    console.error('deleteBlogComment error:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

export async function bulkDeleteBlogComments(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };

    await prisma.blogComment.deleteMany({
      where: { id: { in: ids } }
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'bulk_delete_blog_comments',
        entityType: 'blog_comment',
        entityId: 'multiple',
        description: `Deleted ${ids.length} blog comments`,
      });
    }

    revalidatePath('/admin/reviews', 'page');
    revalidateTag('blog-comments');

    return { success: true };
  } catch (error) {
    console.error('bulkDeleteBlogComments error:', error);
    return { success: false, error: 'Failed to delete comments' };
  }
}

export async function bulkUpdateBlogCommentStatus(ids, approved) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: 'No IDs provided' };

    await prisma.blogComment.updateMany({
      where: { id: { in: ids } },
      data: { approved }
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'bulk_update_blog_comment_status',
        entityType: 'blog_comment',
        entityId: 'multiple',
        description: `Marked ${ids.length} blog comments as ${approved ? 'approved' : 'unapproved'}`,
      });
    }

    revalidatePath('/admin/reviews', 'page');
    revalidateTag('blog-comments');

    return { success: true };
  } catch (error) {
    console.error('bulkUpdateBlogCommentStatus error:', error);
    return { success: false, error: 'Failed to update comments' };
  }
}

export async function replyToBlogComment(id, reply) {
  try {
    const comment = await prisma.blogComment.findUnique({ where: { id }, include: { blog: true } });
    if (!comment) return { success: false, error: 'Comment not found' };

    await prisma.blogComment.update({
      where: { id },
      data: {
        adminReply: reply || null,
        adminReplyAt: reply ? new Date() : null,
      }
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: reply ? 'replied_blog_comment' : 'removed_blog_comment_reply',
        entityType: 'blog_comment',
        entityId: id,
        description: `${reply ? 'Replied to' : 'Removed reply from'} blog comment on '${comment.blog.title}'`,
      });
    }

    revalidatePath('/admin/reviews', 'page');
    revalidatePath(`/blog/${comment.blog.slug}`, 'page');
    revalidateTag('blog-comments');

    return { success: true };
  } catch (error) {
    console.error('replyToBlogComment error:', error);
    return { success: false, error: 'Failed to save reply' };
  }
}

export async function editBlogComment(id, data) {
  try {
    const comment = await prisma.blogComment.findUnique({ where: { id }, include: { blog: true } });
    if (!comment) return { success: false, error: 'Comment not found' };

    const updateData = {};
    if (data.content !== undefined) updateData.content = data.content;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.images !== undefined) updateData.images = data.images;

    await prisma.blogComment.update({
      where: { id },
      data: updateData,
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'edited_blog_comment',
        entityType: 'blog_comment',
        entityId: id,
        description: `Edited blog comment on '${comment.blog.title}'`,
      });
    }

    revalidatePath('/admin/reviews', 'page');
    revalidatePath(`/blog/${comment.blog.slug}`, 'page');
    revalidateTag('blog-comments');

    return { success: true };
  } catch (error) {
    console.error('editBlogComment error:', error);
    return { success: false, error: 'Failed to edit comment' };
  }
}
