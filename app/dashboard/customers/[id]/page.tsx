"use client"
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, use } from 'react'
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Badge } from "../../../../components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCustomerById } from "@/lib/supabase/queries"
import { Reservation, Status, statusColors } from "@/types"
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface CustomerData {
  id: string
  name: string
  email: string
  phone: string
  joined_date: string
  total_visits: number
  reservations: Reservation[]
}

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

function getStatusColor(status: string) {
  return statusColors[status as Status] || '!bg-gray-500/10 !text-gray-500'
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params)
  const [customerData, setCustomerData] = useState<CustomerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    console.log('🔍 Customer Detail Mount:', {
      id,
      timestamp: new Date().toISOString(),
      pathname: window.location.pathname
    })

    const supabase = createBrowserSupabaseClient()
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Auth State Change:', {
      event,
      hasSession: !!session,
      timestamp: new Date().toISOString()
    })
  })
  
    return () => {
      console.log('♻️ Customer Detail Cleanup:', {
        timestamp: new Date().toISOString()
      })
      subscription?.unsubscribe()
    }
  }, [id])
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        console.log('Fetching customer data:', { 
          id,
          timestamp: new Date().toISOString()
        })
        setIsLoading(true)
        
        // handle auth state
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('No authenticated user found')
          return
        }

        const data = await getCustomerById(id)
        console.log('Customer data received:', {
          hasData: !!data,
          timestamp: new Date().toISOString()
        })
        setCustomerData(data)
      } catch (error) {
        console.error('Error fetching customer:', {
          error,
          id,
          timestamp: new Date().toISOString()
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCustomerData()
  }, [id])

  if (isLoading) return <div>Loading...</div>
  if (!customerData) return <div>Customer not found</div>

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DashboardHeader
          heading={`Customer Profile`}
        />
      </div>
      <div className="space-y-6 mt-8">
        <div className="flex gap-6">
          <Card className="w-1/3">
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customerData.name}`} />
                <AvatarFallback>
                {customerData.name[0].split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{customerData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(customerData.joined_date).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{customerData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{customerData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Visits</label>
                  <p>{customerData.total_visits}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Reservation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerData.reservations?.map((reservation: Reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {format(new Date(reservation.date), 'PPP')}
                        </span>
                        <span>
                          {reservation.timeslot_start} - {reservation.timeslot_end}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Party of {reservation.party_size}
                      </div>
                      {reservation.special_requests && (
                        <div className="text-sm text-muted-foreground">
                          Request: {reservation.special_requests}
                        </div>
                      )}
                      {reservation.dietary_restrictions && (
                        <div className="text-sm text-muted-foreground">
                          Dietary: {reservation.dietary_restrictions}
                        </div>
                      )}
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
