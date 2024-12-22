"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CalendarDays, Users, Settings, User } from 'lucide-react'

export function DashboardNav() {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Overview",
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
    <nav className="w-64 min-h-screen bg-card border-r">
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
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
              )}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

