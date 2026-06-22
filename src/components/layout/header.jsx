'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Package, MapPin, LogOut } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import useCartStore from '@/store/cart';
import { customerLogout } from '@/actions/customer-auth';
import { createClient } from '@/lib/supabase/client';
import AnnouncementBar from './announcement-bar';
import SearchBar from './search-bar';
import UserMenu from './user-menu';

const navLinks = [
  { name: 'Home', href: '/' },
];

export default function Header({ onCartOpen, settings }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const itemCount = useCartStore((s) => s.items.length);

  const handleLogout = async () => {
    try {
      await customerLogout();
      const supabase = createClient();
      await supabase.auth.signOut();
      sessionStorage.removeItem('last_user_id');
      setIsLoggedIn(false);
      setLoggedInUser(null);
      setMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <AnnouncementBar settings={settings} />
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-300 border-b border-brand-border`}
      >
        <div className="w-full px-4 sm:px-6 max-w-[1170px] mx-auto">
          {/* Top Row: Logo, Hamburger, Desktop Search, Right Icons */}
          <div className="flex h-[80px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Menu size={22} />
              </button>

              {/* Logo */}
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/rr.png"
                  alt="RoadsRide"
                  width={320}
                  height={80}
                  className="h-10 w-auto sm:h-14 sm:w-40"
                  priority
                  unoptimized
                />
              </Link>
            </div>

            {/* Desktop Center Search Bar */}
            <div className="hidden lg:block flex-1 max-w-2xl px-4">
              <SearchBar />
            </div>

            {/* Right icons */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <UserMenu onUserChange={(u) => { setIsLoggedIn(!!u); setLoggedInUser(u); }} />
              {!isLoggedIn && (
                <Link
                  href="/track-order"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer hidden sm:block"
                  title="Track Order"
                >
                  <Package size={24} className="text-brand-black" />
                </Link>
              )}
              <button
                onClick={onCartOpen}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative cursor-pointer"
              >
                <ShoppingCart size={24} className="text-brand-black" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-yellow text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Row (Only visible below LG screens, outside sticky header so it scrolls away) */}
      <div className="block lg:hidden bg-white px-4 pt-2 pb-4 border-b border-brand-border">
        <div className="w-full max-w-[1170px] mx-auto">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <Sheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="left"
        title={<Image src="/rr.webp" alt="RoadsRide" width={120} height={30} className="h-8 w-auto" />}
      >
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t border-gray-200 my-3" />

          {loggedInUser ? (
            <>
              {/* User Info */}
              <div className="px-4 py-3 flex items-center gap-3">
                {loggedInUser.avatar ? (
                  <img src={loggedInUser.avatar} alt={loggedInUser.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-yellow to-amber-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{loggedInUser.name?.charAt(0)?.toUpperCase()}</span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-brand-black">{loggedInUser.name}</p>
                  <p className="text-xs text-gray-500">{loggedInUser.email}</p>
                </div>
              </div>

              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User size={18} /> Account Details
              </Link>
              <Link
                href="/account?tab=orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Package size={18} /> My Orders
              </Link>
              <Link
                href="/account?tab=addresses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MapPin size={18} /> Saved Addresses
              </Link>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/account/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User size={18} /> Sign In / Register
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Package size={18} /> Track Order
              </Link>
            </>
          )}
        </nav>
      </Sheet>
    </>
  );
}
