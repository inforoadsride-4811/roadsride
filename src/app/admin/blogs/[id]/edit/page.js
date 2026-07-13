import { getAdminBlog } from '@/actions/admin-blogs';
import BlogForm from '@/components/admin/blog-form';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Blog Post | Admin',
};

export default async function EditBlogPage({ params }) {
  const { id } = await params;
  const { success, blog } = await getAdminBlog(id);

  if (!success || !blog) {
    notFound();
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <BlogForm initialData={blog} />
    </main>
  );
}
