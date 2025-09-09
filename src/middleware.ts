
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session if expired - important for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === '/';
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Redirect to dashboard if user is logged in and tries to access login page
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if user is not logged in and tries to access protected routes
  if (!session && isDashboardRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Specific role checks can go here if needed in the future
  // For example:
  // if (session && pathname.startsWith('/admin')) { ... }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
