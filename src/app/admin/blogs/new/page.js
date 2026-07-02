import BlogForm from '@/components/admin/blog-form';

export const metadata = {
  title: 'Create Blog Post | Admin',
};

export default function NewBlogPage() {
  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-screen">
      <BlogForm />
    </main>
  );
}
