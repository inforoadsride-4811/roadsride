import Link from 'next/link';
import Image from 'next/image';
import { getCachedPublishedBlogs } from '@/actions/blogs';
import { Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Blog | RoadsRide',
  description: 'Read the latest automotive care tips, product updates, and news from RoadsRide.',
};

export default async function BlogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page || '1');
  const response = await getCachedPublishedBlogs({ page, limit: 12 });
  const blogs = response.success ? response.blogs : [];
  const pagination = response.success ? response.pagination : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black mb-4">
            RoadsRide <span className="text-brand-yellow">Blog</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the latest automotive care tips, product announcements, and industry news to keep your ride looking its best.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No posts yet</h2>
            <p className="text-gray-500">Check back soon for exciting new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full group">
                <Link href={`/blog/${blog.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-gray-100 shrink-0">
                  {blog.coverImage ? (
                    <Image 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-brand-yellow" />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {blog.author && (
                      <div className="flex items-center gap-1.5">
                        <User size={14} className="text-brand-yellow" />
                        {blog.author}
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-brand-black mb-3 line-clamp-2 group-hover:text-brand-yellow transition-colors">
                    <Link href={`/blog/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
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
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-16 flex justify-center gap-2">
            {pagination.page > 1 && (
              <Link 
                href={`/blog?page=${pagination.page - 1}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors bg-white text-brand-black hover:bg-gray-100 border border-gray-200"
              >
                <ChevronLeft size={20} />
              </Link>
            )}

            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <Link 
                key={i}
                href={`/blog?page=${i + 1}`}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${
                  pagination.page === i + 1 
                    ? 'bg-brand-black text-white' 
                    : 'bg-white text-brand-black hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {i + 1}
              </Link>
            ))}

            {pagination.page < pagination.totalPages && (
              <Link 
                href={`/blog?page=${pagination.page + 1}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors bg-white text-brand-black hover:bg-gray-100 border border-gray-200"
              >
                <ChevronRight size={20} />
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
