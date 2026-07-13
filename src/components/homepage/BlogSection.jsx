import Link from 'next/link';
import Image from 'next/image';
import { getCachedPublishedBlogs } from '@/actions/blogs';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default async function BlogSection() {
  const response = await getCachedPublishedBlogs({ page: 1, limit: 3 });
  const blogs = response.success ? response.blogs : [];

  if (blogs.length === 0) return null;

  return (
    <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-black tracking-tight">
            Latest from Our <span className="text-brand-yellow">Blog</span>
          </h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Tips, guides, and news to keep your ride in top shape.
          </p>
        </div>
        <Link
          href="/blog"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-brand-black hover:text-brand-yellow transition-colors"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <article
            key={blog.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full group"
          >
            <Link
              href={`/blog/${blog.slug}`}
              className="block relative aspect-[16/10] overflow-hidden bg-gray-100 shrink-0"
            >
              {blog.coverImage ? (
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-yellow/20 to-brand-black/5">
                  <span className="text-4xl">📝</span>
                </div>
              )}
            </Link>

            <div className="p-5 flex flex-col flex-grow">
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-yellow" />
                  {new Date(blog.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                {blog.author && (
                  <div className="flex items-center gap-1.5">
                    <User size={13} className="text-brand-yellow" />
                    {blog.author}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-brand-black mb-2 line-clamp-2 group-hover:text-brand-yellow transition-colors">
                <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
              </h3>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                {blog.excerpt || 'Read more about this exciting update...'}
              </p>

              <Link
                href={`/blog/${blog.slug}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-black hover:text-brand-yellow transition-colors mt-auto"
              >
                Read Article <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-black hover:text-brand-yellow transition-colors"
        >
          View All Posts <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
