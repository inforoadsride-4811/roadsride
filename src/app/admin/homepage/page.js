import { getHomepageSections } from '@/actions/admin-homepage';
import prisma from '@/lib/db';
import HomepageBuilderClient from './builder-client';

export const metadata = {
  title: 'Homepage Settings | Admin',
};

export default async function AdminHomepageBuilder() {
  const { success, sections, error } = await getHomepageSections();
  const categories = await prisma.category.findMany({ where: { isActive: true }, select: { id: true, name: true } });

  if (!success) {
    return <div className="p-6 text-red-500">Error loading homepage builder: {error}</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Homepage Data Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the data for the predefined homepage sections.</p>
      </div>
      
      <HomepageBuilderClient sections={sections} categories={categories} />
    </div>
  );
}
