import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Lightweight admin check in middleware (no Prisma in edge runtime)
// We use a cookie flag set during admin login to avoid DB calls here
async function isAdminSession(request) {
  const { user } = await updateSession(request);
  return { user };
}

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
  // The actual admin role check happens in getSessionAdmin() on each page
  if (pathname.startsWith('/admin')) {
    const { user, supabaseResponse } = await updateSession(request);

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  // For all other routes, just refresh session
  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
