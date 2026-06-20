'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, User, ShoppingCart, Menu, X, ChevronDown, Package } from 'lucide-react';
import { Sheet } from '@/components/ui/sheet';
import useCartStore from '@/store/cart';
import AnnouncementBar from './announcement-bar';

const navLinks = [
  // { name: 'Home', href: '/' },
  // { name: 'Shop', href: '/', hasDropdown: true },
  // { name: 'Blog', href: '#' },
  // { name: 'About', href: '#' },
  // { name: 'Compare', href: '#' },
  // { name: 'Track Order', href: '/track-order' },
  // { name: 'Wishlist', href: '#' },
  // { name: 'Contact Us', href: '#' },
  // {ß}
];

export default function Header({ onCartOpen }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

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
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-800 bg-white transition-shadow duration-300 border-b border-brand-border`}
      >
        <div className="w-full px-4 sm:px-6" style={{ maxWidth: '1170px', margin: '0 auto' }}>
          <div className="grid h-[80px] grid-cols-[auto_1fr_auto] items-center gap-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 hidden rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/rr.webp"
                alt="RoadsRide"
                width={160}
                height={40}
                className="h-14 w-40  md:h-14"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center justify-center gap-4 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-brand-black xl:px-3"
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown size={14} />}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center justify-end gap-2">
              <Link
                href="/track-order"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Track Order"
              >
                <Package size={24} className="text-brand-black" />
              </Link>
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

      {/* Mobile Menu Drawer */}
      <Sheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        side="left"
        title="Menu"
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
        </nav>
      </Sheet>
    </>
  );
}
