
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
        cookies: {
            get(name: string) {
                return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: any) {
                request.cookies.set({
                    name,
                    value,
                    ...options,
                })
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                })
                response.cookies.set({
                    name,
                    value,
                    ...options,
                })
            },
            remove(name: string, options: any) {
                request.cookies.set({
                    name,
                    value: '',
                    ...options,
                })
                response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                })
                response.cookies.set({
                    name,
                    value: '',
                    ...options,
                })
            },
        },
    }
  )

  // IMPORTANT: Avoid running middleware on API routes, static files, and other non-page routes.
  // This is a basic example, you might need to adjust the matcher in the config below.
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/static/') ||
    request.nextUrl.pathname.startsWith('/_next/')
  ) {
    return response
  }

  await supabase.auth.getSession()

  return response
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
  }
