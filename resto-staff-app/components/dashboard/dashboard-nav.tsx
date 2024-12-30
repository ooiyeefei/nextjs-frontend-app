"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CalendarDays, Users, Settings, User, LogOut } from 'lucide-react'
import { Button } from "../ui/button"
import { createBrowserClient } from '@supabase/ssr'

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Reservations",
      href: "/dashboard/reservations",
      icon: CalendarDays,
    },
    {
      name: "Customers",
      href: "/dashboard/customers",
      icon: Users,
    },
    {
      name: "Booking Options",
      href: "/dashboard/booking-options",
      icon: Settings,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  return (
    <nav className="flex flex-col w-64 min-h-screen bg-card border-r">
      {/* Top section with main navigation */}
      <div className="flex-1">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">
              Restaurant Dashboard
            </h2>
          </div>
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-7 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                )}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section with settings and logout */}
      <div className="border-t p-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start px-7"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}

