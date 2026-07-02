'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Package, FolderTree, Users, Settings, LogOut, Search, Mail, Home, MessageSquare, Star, BookOpen } from 'lucide-react';
import { adminLogout } from '@/actions/auth';
import { getPendingQACount } from '@/actions/qa';
import { useToast } from '@/components/ui/toast';
import { useEffect, useState } from 'react';
import useAdminStore from '@/store/admin';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Homepage', href: '/admin/homepage', icon: Home },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Q & A', href: '/admin/qa', icon: MessageSquare },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Abandoned Checkouts', href: '/admin/drafts', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Subscribers', href: '/admin/subscribers', icon: Mail },
  { name: 'Blog', href: '/admin/blogs', icon: BookOpen },
  { name: 'About Page', href: '/admin/about-page', icon: BookOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();
  const [pendingQA, setPendingQA] = useState(0);
  const isDirty = useAdminStore((state) => state.isDirty);
  const setDirty = useAdminStore((state) => state.setDirty);

  useEffect(() => {
    // Fetch pending QA count on mount and every 30s
    const fetchQACount = async () => {
      const res = await getPendingQACount();
      if (res.success) setPendingQA(res.count);
    };
    fetchQACount();
    const interval = setInterval(fetchQACount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    const { success } = await adminLogout();
    if (success) {
      router.push('/admin/login');
      router.refresh();
    } else {
      addToast({ title: 'Logout failed', type: 'error' });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-brand-border w-64 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-brand-border">
        <span className="text-xl font-bold text-brand-black tracking-tight">Roads<span className="text-brand-yellow">Ride</span> Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => {
                if (isDirty) {
                  if (!window.confirm('You have unsaved changes. Are you sure you want to leave without saving?')) {
                    e.preventDefault();
                    return;
                  } else {
                    setDirty(false);
                  }
                }
                setMobileOpen?.(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'admin-nav-active' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-brand-black'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? 'text-brand-yellow' : 'text-gray-400'} />
                {item.name}
              </div>
              {item.name === 'Q & A' && pendingQA > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingQA}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-brand-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-brand-danger hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileOpen(false)} 
          />
          <div className="relative z-10 h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}

export function AdminHeader({ setSidebarOpen }) {
  return (
    <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <div className="hidden sm:flex items-center bg-gray-50 border border-brand-border rounded-lg px-3 py-1.5 focus-within:border-brand-yellow focus-within:ring-1 focus-within:ring-brand-yellow/30 transition-all">
          <Search size={16} className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="bg-transparent border-none outline-none text-sm w-64 text-brand-black placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-yellow/20 rounded-full flex items-center justify-center text-sm font-bold text-brand-black">
          AD
        </div>
      </div>
    </header>
  );
}
