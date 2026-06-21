import { createServerClient } from '@supabase/ssr';

export async function updateSession(request) {
  const { NextResponse } = await import('next/server');
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { user, supabaseResponse };
  } catch (error) {
    // Network errors (Supabase unreachable) — let the request through
    console.error('Middleware session refresh failed:', error?.message || error);
    return { user: null, supabaseResponse };
  }
}
