export const metadata = {
  title: 'Settings | Admin',
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-black">Store Settings</h1>
      <div className="bg-white border border-brand-border rounded-xl p-8 text-center shadow-sm">
        <p className="text-gray-500">Settings module is under construction.</p>
        <p className="text-sm text-gray-400 mt-2">Manage tax rates, shipping zones, and admin users here.</p>
      </div>
    </div>
  );
}
