import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow admin login page without auth
  if (pathname === '/admin/login') {
    const { user, supabaseResponse } = await updateSession(request);
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return supabaseResponse;
  }

  // Protect all admin routes — require authenticated user
  if (pathname.startsWith('/admin')) {
    const { user, supabaseResponse } = await updateSession(request);

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  // Account routes need session refresh
  if (pathname.startsWith('/account')) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  // All other public routes (homepage, checkout, product, blog, etc.)
  // skip Supabase auth entirely — no need to waste 200-400ms on a
  // network round-trip to Supabase for pages that don't need auth.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
