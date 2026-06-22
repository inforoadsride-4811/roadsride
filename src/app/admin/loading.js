import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-black" />
        <p className="text-sm font-medium text-gray-500">Loading Dashboard...</p>
      </div>
    </div>
  );
}
