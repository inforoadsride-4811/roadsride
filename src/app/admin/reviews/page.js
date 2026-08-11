import { getAdminReviews } from '@/actions/review';
import { getAdminBlogComments } from '@/actions/admin-blog-comments';
import ReviewsClient from '@/components/admin/reviews-client';
import BlogCommentsClient from '@/components/admin/blog-comments-client';
import Link from 'next/link';

export const metadata = {
  title: 'Manage Reviews | Admin',
};

export default async function AdminReviewsPage({ searchParams }) {
  const { page = '1', search = '', status = 'all', tab = 'products' } = await searchParams;
  
  const isBlogTab = tab === 'blogs';

  let response;
  if (isBlogTab) {
    response = await getAdminBlogComments({
      page: parseInt(page, 10),
      limit: 20,
      search,
      status
    });
  } else {
    response = await getAdminReviews({
      page: parseInt(page, 10),
      limit: 20,
      search,
      status
    });
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-gray-500 mt-1">Approve, reject, and manage comments and reviews.</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-200">
        <Link 
          href={`/admin/reviews?tab=products&status=${status}`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            !isBlogTab 
              ? 'border-brand-black text-brand-black' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Product Reviews
        </Link>
        <Link 
          href={`/admin/reviews?tab=blogs&status=${status}`}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            isBlogTab 
              ? 'border-brand-black text-brand-black' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Blog Comments
        </Link>
      </div>

      {isBlogTab ? (
        <BlogCommentsClient 
          initialData={response.success ? response.comments : []}
          pagination={response.pagination}
        />
      ) : (
        <ReviewsClient 
          initialData={response.success ? response.reviews : []}
          pagination={response.pagination}
        />
      )}
    </div>
  );
}
