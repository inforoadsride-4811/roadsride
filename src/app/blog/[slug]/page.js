import { getCachedBlogBySlug } from '@/actions/blogs';
import { getApprovedBlogComments } from '@/actions/blog-comments';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ChevronLeft, Share2 } from 'lucide-react';
import BlogCommentsSection from '@/components/blog/blog-comments-section';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const { success, blog } = await getCachedBlogBySlug(slug);

  if (!success || !blog) {
    return { title: 'Post Not Found | RoadsRide' };
  }

  return {
    title: blog.seoTitle || `${blog.title} | RoadsRide Blog`,
    description: blog.seoDescription || blog.excerpt || 'Read this article on RoadsRide.',
    keywords: blog.seoKeywords || 'car care, automotive, blog, roadsride',
    openGraph: {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : [],
    },
  };
}

export default async function SingleBlogPage({ params }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const { success, blog } = await getCachedBlogBySlug(slug);

  if (!success || !blog) {
    notFound();
  }

  // Fetch approved comments for this blog post
  const commentsResult = await getApprovedBlogComments(blog.id);
  const initialComments = commentsResult.success ? commentsResult.comments : [];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-brand-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-yellow hover:text-white font-medium text-sm transition-colors mb-8">
            <ChevronLeft size={16} /> Back to Blog
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            {blog.title}
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand-yellow" />
              {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {blog.author && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-brand-yellow" />
                {blog.author}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        {blog.coverImage && (
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-12 shadow-lg -mt-24 z-10 border-4 border-white">
            <Image 
              src={blog.coverImage} 
              alt={blog.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-brand-black prose-a:text-brand-yellow hover:prose-a:text-yellow-600 prose-img:rounded-xl">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900">Share this article:</span>
            {/* Simple share buttons for demo */}
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`https://roadsride.com/blog/${blog.slug}`)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://roadsride.com/blog/${blog.slug}`)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#4267B2] hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
          
          <Link href="/blog">
            <button className="px-6 py-2.5 bg-brand-yellow text-brand-black font-bold rounded-lg hover:bg-brand-yellow-hover transition-colors">
              More Articles
            </button>
          </Link>
        </div>

        <BlogCommentsSection blogId={blog.id} initialComments={initialComments} />
      </main>
    </div>
  );
}
