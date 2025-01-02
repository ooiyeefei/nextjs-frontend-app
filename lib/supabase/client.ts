import { createBrowserClient } from '@supabase/ssr'
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"

// Type for public-facing schema (only include what should be public)
type Database = {
  customers: {
    Row: {
      id: string
      name: string | null
      email: string | null
      phone: string | null
      total_visits: number
      joined_date: string
    }
  }
  reservations: {
    Row: {
      reservation_id: string
      reservation_time: string | null
      customer_email: string | null
      status: string | null
      special_requests: string | null
      dietary_restrictions: string | null
      party_size: number | null
    }
  }
}

// Browser client for client-side operations
export const createBrowserSupabaseClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Server client for server-side operations
export const createServerSupabaseClient = async (cookieStore: Promise<ReturnType<typeof cookies>> | ReturnType<typeof cookies>) => {
  const resolvedCookies = await Promise.resolve(cookieStore)
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return resolvedCookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          resolvedCookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          resolvedCookies.set({ name, value: "", ...options })
        },
      },
    }
  )
}