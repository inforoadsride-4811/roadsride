import { getAllDrafts } from '@/actions/drafts';
import DraftsClient from '@/components/admin/drafts-client';

export const metadata = {
  title: 'Abandoned Checkouts | RoadsRide Admin',
};

export default async function DraftsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const search = resolvedParams.search || '';
  const status = resolvedParams.status || 'all';

  const { drafts = [], pagination = {} } = await getAllDrafts({
    page,
    limit: 10,
    search,
    status,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-black">Abandoned Checkouts</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage incomplete checkouts</p>
      </div>

      <DraftsClient 
        initialData={drafts} 
        pagination={pagination} 
      />
    </div>
  );
}
