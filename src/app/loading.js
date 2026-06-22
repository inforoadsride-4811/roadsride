import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-yellow" />
        <p className="text-sm font-medium text-gray-500">Loading RoadsRide...</p>
      </div>
    </div>
  );
}
