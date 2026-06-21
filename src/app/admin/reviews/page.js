import { getAdminReviews } from '@/actions/review';
import ReviewsClient from '@/components/admin/reviews-client';

export const metadata = {
  title: 'Manage Reviews | Admin',
};

export default async function AdminReviewsPage({ searchParams }) {
  const { page = '1', search = '', status = 'all' } = await searchParams;
  
  const response = await getAdminReviews({
    page: parseInt(page, 10),
    limit: 20,
    search,
    status
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-gray-500 mt-1">Approve, reject, and feature customer reviews.</p>
        </div>
      </div>

      <ReviewsClient 
        initialData={response.success ? response.reviews : []}
        pagination={response.pagination}
      />
    </div>
  );
}
