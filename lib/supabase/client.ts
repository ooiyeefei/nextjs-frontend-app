import { createBrowserClient } from '@supabase/ssr'
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"
import { Customer, Reservation, BusinessProfile, Product, ReservationSetting } from "@/types"

// Type for public-facing schema (only include what should be public)
type Database = {
  customers: {
    Row: Omit<Customer, 'reservation_id'> & {
      business_id: string
      reservation_id: string | null
    }
  }
  reservations: {
    Row: Omit<Reservation, 'customers'> & {
      business_id: string
    }
  }
  business_profiles: {
    Row: Omit<BusinessProfile, 'id'> & {
      id: string
    }
  }
  products: {
    Row: Product
  }
  reservation_settings: {
    Row: ReservationSetting
  }
}

// Browser client for client-side operations
export const createBrowserSupabaseClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    }
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