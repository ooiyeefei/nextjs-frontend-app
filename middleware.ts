import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Supabase auth error:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Middleware error:', err.message);
    } else {
      console.error('Unknown middleware error:', err);
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*'
  ]
}