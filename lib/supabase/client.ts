import { createBrowserClient } from '@supabase/ssr'
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"

type Database = {
  users: {
    Row: {
      id: string
      email: string
      name: string[]
      phone: string[]
      joined_date: string
      is_business_user: boolean
      business_id: string | null
      total_visits: number | null
      is_registered: boolean
    }
  }
  business_profiles: {
    Row: {
      id: string
      slug: string
      name: string
      cuisine: string | null
      address: string
      google_place_id: string | null
      google_latitude: number | null
      google_longitude: number | null
      google_maps_url: string | null
      images: string[] | null
      cancellation_policy: string | null
      refund_policy: string | null
      general_policy: string | null
      data_usage_policy: string | null
      min_allowed_booking_advance_hours: number
      max_allowed_booking_advance_hours: number
      allowed_cancellation_hours: number
      created_at: string
      updated_at: string
      is_active: boolean
      is_deposit_required: boolean
      operating_hours: Record<string, any>
      description: string | null
      timezone: string
      owner_user_id: string
    }
  }
  reservations: {
    Row: {
      id: string
      confirmation_code: string
      date: string
      timeslot_start: string
      timeslot_end: string
      party_size: number
      status: 'new' | 'cancelled' | 'completed'
      created_at: string
      updated_at: string
      customer_id: string
      customer_name: string
      customer_email: string
      customer_phone: string
      deposit_amount: number | null
      is_deposit_made: boolean | null
      dietary_restrictions: string | null
      business_id: string
      special_occasions: string | null
      special_requests: string | null
    }
  }
  reservation_settings: {
    Row: {
      id: string
      business_id: string
      day_of_week: number
      reservation_start_time: string
      reservation_end_time: string
      capacity_settings: Record<string, any>
      specific_date: string | null
      is_default: boolean
      timeslot_length_minutes: number
    }
  }
  products: {
    Row: {
      id: string
      business_id: string
      name: string
      description: string | null
      price: number
      image_urls: string[] | null
      is_active: boolean
      created_at: string
      updated_at: string
      category: string
      stock_quantity: number | null
      discount: number | null
      rating: number | null
      tags: Record<string, any> | null
    }
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