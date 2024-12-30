"use client"
import { use } from 'react'
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Badge } from "../../../../components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCustomerById } from "@/lib/supabase/queries"

type Status = 'arriving-soon' | 'late' | 'no-show' | 'confirmed' | 'seated' | 'completed'

const statusColors: Record<Status, string> = {
  'arriving-soon': '!bg-yellow-500/10 !text-yellow-500',
  'late': '!bg-red-500/10 !text-red-500',
  'no-show': '!bg-gray-500/10 !text-gray-500',
  'confirmed': '!bg-blue-500/10 !text-blue-500',
  'seated': '!bg-green-500/10 !text-green-500',
  'completed': '!bg-green-500/10 !text-green-500',
}

interface Reservation {
  reservation_id: string
  reservation_time: string
  party_size: number
  status: Status
  special_requests?: string
  dietary_restrictions?: string
}

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

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true)
        const data = await getCustomerById(id)
        setCustomerData(data)
      } catch (error) {
        console.error('Error fetching customer:', error)
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
                  <AvatarFallback>{customerData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                {customerData.reservations?.map((reservation) => (
                  <div
                    key={reservation.reservation_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {new Date(reservation.reservation_time).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>at {new Date(reservation.reservation_time).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
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
