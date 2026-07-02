'use server';

import prisma from '@/lib/db';
import { generateSlug } from '@/lib/product'; // Reusing generateSlug for consistency
import { logAdminActivity } from '@/actions/admin';
import { getSessionAdmin } from '@/actions/auth';
import { revalidatePath, revalidateTag } from 'next/cache';

// ==========================================
// BLOG CRUD
// ==========================================

export async function getAdminBlogs({ page = 1, limit = 10, search = '', status = '' } = {}) {
  try {
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      success: true,
      blogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('getAdminBlogs error:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

export async function getAdminBlog(id) {
  try {
    const blog = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!blog) return { success: false, error: 'Blog post not found' };
    
    return { success: true, blog };
  } catch (error) {
    return { success: false, error: 'Failed to fetch blog post' };
  }
}

export async function createBlogPost(data) {
  try {
    let slug = data.slug || generateSlug(data.title);

    // Ensure unique slug
    let existing = await prisma.blogPost.findUnique({ where: { slug } });
    let counter = 1;
    const baseSlug = slug;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await prisma.blogPost.findUnique({ where: { slug } });
      counter++;
    }

    const blog = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        status: data.status || 'draft',
        author: data.author || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
      },
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'created_blog',
        entityType: 'blog',
        entityId: blog.id,
        description: `Created blog post '${blog.title}'`,
      });
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    revalidateTag('blog');
    return { success: true, blog };
  } catch (error) {
    console.error('createBlogPost error:', error);
    return { success: false, error: 'Failed to create blog post' };
  }
}

export async function updateBlogPost(id, data) {
  try {
    // Handle slug uniqueness if slug is being changed
    if (data.slug) {
      const existing = await prisma.blogPost.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) {
        return { success: false, error: 'Slug already exists. Please choose a different slug.' };
      }
    }

    const updateData = {};
    const fields = [
      'title', 'slug', 'excerpt', 'content', 'coverImage',
      'status', 'author', 'seoTitle', 'seoDescription', 'seoKeywords'
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const blog = await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'updated_blog',
        entityType: 'blog',
        entityId: blog.id,
        description: `Updated blog post '${blog.title}'`,
      });
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    revalidateTag('blog');
    if (blog?.slug) revalidateTag(`blog-${blog.slug}`);
    return { success: true, blog };
  } catch (error) {
    console.error('updateBlogPost error:', error);
    return { success: false, error: 'Failed to update blog post' };
  }
}

export async function deleteBlogPost(id) {
  try {
    const blog = await prisma.blogPost.findUnique({ where: { id } });
    if (!blog) return { success: false, error: 'Not found' };

    await prisma.blogPost.delete({ where: { id } });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'deleted_blog',
        entityType: 'blog',
        entityId: id,
        description: `Deleted blog post '${blog.title}'`,
      });
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blogs');
    revalidateTag('blog');
    if (blog?.slug) revalidateTag(`blog-${blog.slug}`);
    return { success: true };
  } catch (error) {
    console.error('deleteBlogPost error:', error);
    return { success: false, error: 'Failed to delete blog post' };
  }
}
