import { getStoreSettings } from '@/actions/admin-products';
import SettingsClient from '@/components/admin/settings-client';

export const metadata = {
  title: 'Store Settings | Admin',
};

export default async function AdminSettingsPage() {
  const { success, settings, error } = await getStoreSettings();

  if (!success) {
    return <div className="p-6 text-red-500">Error loading settings: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-black">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global configuration for your store</p>
        </div>
        <SettingsClient initialSettings={settings} />
      </div>
    </div>
  );
}
