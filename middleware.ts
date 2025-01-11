import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    headers: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })

  console.log('🔐 Middleware Check:', {
    path: request.nextUrl.pathname,
    timestamp: new Date().toISOString(),
    hasAuthCookie: !!request.cookies.get('sb-access-token'),
    method: request.method
  })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          console.log('Middleware Cookie Get:', { name, value: request.cookies.get(name)?.value })
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          console.log('Middleware Cookie Set:', { name, value, options })
          // Set cookies on both request and response
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          console.log('Middleware Cookie Remove:', { name, options })
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  console.log('Request Path:', request.nextUrl.pathname)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log('Auth State:', { 
    hasUser: !!user,
    path: request.nextUrl.pathname,
    cookies: Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    )
  })

  if (!user && (
    request.nextUrl.pathname.startsWith('/dashboard')  ||
    request.nextUrl.pathname.includes('/customers/')
  )) {
    console.log('Redirecting to login:', { 
      from: request.nextUrl.pathname,
      reason: 'No authenticated user'
    })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dashboard/customers/:id*'
  ]
}