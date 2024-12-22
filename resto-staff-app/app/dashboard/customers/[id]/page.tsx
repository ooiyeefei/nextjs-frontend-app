"use client"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Badge } from "../../../../components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Reservation {
  id: string
  date: string
  time: string
  partySize: number
  status: 'upcoming' | 'no-show' | 'completed'
  specialRequests?: string
  dietaryRestrictions?: string
}
interface CustomerDetailPageProps {
    params: {
      id: string
    }
  }

const customerData = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  joinedDate: "January 2023",
  totalVisits: 15,
  reservations: [
    {
      id: "1",
      date: "2024-01-15",
      time: "19:00",
      partySize: 4,
      status: "upcoming",
      specialRequests: "Window seat preferred",
      dietaryRestrictions: "Nut allergy"
    },
    {
      id: "2",
      date: "2023-12-25",
      time: "18:00",
      partySize: 6,
      status: "completed"
    },
    {
      id: "3",
      date: "2023-11-30",
      time: "20:00",
      partySize: 2,
      status: "no-show"
    }
  ] as Reservation[]
}

function getStatusColor(status: string) {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-500/10 text-blue-500'
    case 'completed':
      return 'bg-green-500/10 text-green-500'
    case 'no-show':
      return 'bg-gray-500/10 text-gray-500'
    default:
      return 'bg-gray-500/10 text-gray-500'
  }
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  return (
    <>
    <DashboardHeader
        heading={customerData.name}
        text={`Customer details and reservation history`}
      />
      <div className="space-y-6">
        <div className="flex gap-6">
        <div className="flex items-center space-x-4 mb-8">
        <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="flex items-center space-x-2"
        >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Customers</span>
        </Button>
    </div>
        <div className="space-y-6">
        <div className="flex gap-6">
            {/* Customer Profile Card */}
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
                    <p className="text-sm text-muted-foreground">Member since {customerData.joinedDate}</p>
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
                    <p>{customerData.totalVisits}</p>
                </div>
                </div>
            </CardContent>
            </Card>

            {/* Reservations List */}
            <Card className="flex-1">
            <CardHeader>
                <CardTitle>Reservation History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {customerData.reservations.map((reservation) => (
                    <div
                    key={reservation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    >
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                        <span className="font-medium">
                            {new Date(reservation.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                            })}
                        </span>
                        <span>at {reservation.time}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                        Party of {reservation.partySize}
                        </div>
                        {reservation.specialRequests && (
                        <div className="text-sm text-muted-foreground">
                            Request: {reservation.specialRequests}
                        </div>
                        )}
                        {reservation.dietaryRestrictions && (
                        <div className="text-sm text-muted-foreground">
                            Dietary: {reservation.dietaryRestrictions}
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
        </div>
        </div>
    </>
  )
}

