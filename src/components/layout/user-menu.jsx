'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { User, ChevronDown, Package, MapPin, LogOut, Settings } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getSessionCustomer, customerLogout } from '@/actions/customer-auth';
import { createClient } from '@/lib/supabase/client';
import useCartStore from '@/store/cart';

export default function UserMenu({ onUserChange }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef(null);
  const onUserChangeRef = useRef(onUserChange);
  const router = useRouter();
  const pathname = usePathname();

  // Keep ref in sync
  onUserChangeRef.current = onUserChange;

  // Single fetch on mount — no cascading re-renders
  useEffect(() => {
    setMounted(true);
    let cancelled = false;

    const fetchUser = async () => {
      try {
        const res = await getSessionCustomer();
        if (cancelled) return;
        if (res?.success && res?.customer) {
          const currentUserId = res.customer.id;
          const prevUserId = sessionStorage.getItem('last_user_id');

          if (prevUserId !== currentUserId) {
            sessionStorage.setItem('last_user_id', currentUserId);
            // Force re-sync cart from DB because user changed/logged in
            useCartStore.setState({ _synced: false });
            useCartStore.getState().loadFromDB();
          }

          setUser(res.customer);
          onUserChangeRef.current?.(res.customer);
        } else {
          sessionStorage.removeItem('last_user_id');
          setUser(null);
          onUserChangeRef.current?.(null);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
          onUserChangeRef.current?.(null);
        }
      }
    };

    fetchUser();

    // Listen for auth changes (login/logout only)
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        sessionStorage.removeItem('cart_synced');
        fetchUser();
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUser();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]); // Re-run fetchUser whenever the route changes to catch client-side login redirects

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleSignOut = async () => {
    await customerLogout();
    setUser(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  };

  const avatarUrl = user?.avatar;
  const fullName = user?.name || 'User';
  const firstName = fullName.split(' ')[0];

  if (!mounted) {
    return (
      <div className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:block">
        <User size={24} className="text-brand-black" />
      </div>
    );
  }

  return (
    <div 
      className="relative hidden sm:block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={user ? "/account" : "/account/login"}>
        <div className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          {user && avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-7 h-7 rounded-full object-cover border border-gray-200" />
          ) : user ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-yellow to-amber-400 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{firstName.charAt(0).toUpperCase()}</span>
            </div>
          ) : (
            <User size={24} className="text-brand-black" />
          )}
          <div className="flex flex-col text-xs leading-tight ml-1">
            <span className="text-gray-600">Hello, {user ? firstName : 'sign in'}</span>
            <span className="font-bold flex items-center">
              Account & Lists
              <ChevronDown size={14} className="ml-1 text-gray-500" />
            </span>
          </div>
        </div>
      </Link>

      {/* Dropdown Panel */}
      {open && (
        <div 
          className="absolute right-0 top-full mt-1 bg-white border border-brand-border rounded-lg shadow-xl z-50 p-4"
          style={{ width: '280px' }}
        >
          {/* ── LOGGED OUT STATE ── */}
          {!user && (
            <>
              <div className="flex flex-col items-center pb-3 mb-3 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <User size={20} className="text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-brand-black">Welcome!</p>
                <p className="text-xs text-gray-500">Sign in for the best experience</p>
              </div>

              <nav className="space-y-1">
                <Link href="/account/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white bg-brand-yellow hover:bg-yellow-500 rounded-lg transition-colors justify-center">
                  Sign In
                </Link>
                <Link href="/account/signup" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-brand-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors justify-center">
                  Create Account
                </Link>
              </nav>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <nav className="space-y-1">
                  <Link href="/track-order" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Package size={16} className="text-gray-400" /> Track Order
                  </Link>
                </nav>
              </div>
            </>
          )}

          {/* ── LOGGED IN STATE ── */}
          {user && (
            <>
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-yellow to-amber-400 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{firstName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-black text-sm truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings size={16} className="text-gray-400" /> Account Details
                </Link>
                <Link href="/account?tab=orders" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Package size={16} className="text-gray-400" /> My Orders
                </Link>
                <Link href="/account?tab=addresses" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <MapPin size={16} className="text-gray-400" /> Saved Addresses
                </Link>
              </nav>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full cursor-pointer">
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
