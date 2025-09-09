
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

const protectedRoutes = ['/dashboard', '/admin'];
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  if (session && (pathname === '/' || pathname === '/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!session && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (session && adminRoutes.includes(pathname)) {
    // **CAMBIO CLAVE: Leer desde la tabla 'users' en lugar de 'profiles'**
    const { data: user, error } = await supabase
      .from('users') 
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error || !user || user.role !== 'admin') {
      console.log('Middleware: Acceso de no-administrador denegado. Redirigiendo...');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.log('Middleware: Acceso de administrador verificado.');
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/admin',
  ],
};
