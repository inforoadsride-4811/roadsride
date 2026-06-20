'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar, AdminHeader } from '@/components/admin/admin-layout';

export default function AdminRootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Don't show sidebar/header on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
