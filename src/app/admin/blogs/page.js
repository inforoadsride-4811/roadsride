import { getAdminBlogs } from '@/actions/admin-blogs';
import BlogsClient from '@/components/admin/blogs-client';

export const metadata = {
  title: 'Manage Blogs | Admin',
};

export default async function AdminBlogsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1');
  const search = resolvedSearchParams.search || '';
  const status = resolvedSearchParams.status || '';

  const response = await getAdminBlogs({ page, limit: 20, search, status });

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Blogs</h1>
          <p className="text-gray-500 mt-1">Create, edit, and publish blog posts.</p>
        </div>

        <BlogsClient 
          initialData={response.success ? response.blogs : []}
          pagination={response.success ? response.pagination : { page: 1, totalPages: 1 }}
        />
      </div>
    </main>
  );
}
