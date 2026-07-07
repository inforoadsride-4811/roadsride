import { getAboutPageData } from '@/actions/about';
import AboutPageForm from '@/components/admin/about-page-form';

export const metadata = {
  title: 'Manage About Page | Admin',
};

export default async function AdminAboutPage() {
  const { data } = await getAboutPageData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bo ld tracking-tight">About Page Content</h1>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-6">
          <AboutPageForm initialData={data} />
        </div>
      </div>
    </div>
  );
}
