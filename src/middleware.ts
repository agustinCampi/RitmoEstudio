
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session if expired - important for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Redirect to dashboard if user is logged in and tries to access root
  if (session && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if user is not logged in and tries to access protected routes
  if (!session && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (session && pathname.startsWith('/admin')) {
      const { data: user, error } = await supabase
      .from('users') 
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

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
