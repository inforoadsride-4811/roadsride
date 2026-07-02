'use server';

import prisma from '@/lib/db';
import { unstable_cache } from 'next/cache';

export async function getPublishedBlogs({ page = 1, limit = 9 } = {}) {
  try {
    const where = { status: 'published' };
    
    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          createdAt: true,
        }
      }),
      prisma.blogPost.count({ where }),
    ]);

    return {
      success: true,
      blogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('getPublishedBlogs error:', error);
    return { success: false, error: 'Failed to fetch blogs' };
  }
}

export const getCachedPublishedBlogs = unstable_cache(
  async (params) => getPublishedBlogs(params),
  ['published-blogs'],
  { tags: ['blog'], revalidate: 3600 }
);

export async function getBlogBySlug(slug) {
  try {
    const blog = await prisma.blogPost.findUnique({
      where: { slug, status: 'published' },
    });
    
    if (!blog) return { success: false, error: 'Blog not found' };
    
    return { success: true, blog };
  } catch (error) {
    console.error('getBlogBySlug error:', error);
    return { success: false, error: 'Failed to fetch blog post' };
  }
}

export const getCachedBlogBySlug = unstable_cache(
  async (slug) => getBlogBySlug(slug),
  ['blog-by-slug'],
  { tags: ['blog'], revalidate: 3600 }
);
