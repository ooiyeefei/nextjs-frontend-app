"use client"

import { useEffect, useState } from "react"
import { getReservations, updateReservationStatus } from "@/lib/supabase/queries"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"

type Status = 'arriving-soon' | 'late' | 'no-show' | 'confirmed' | 'seated' | 'completed'

const statusColors: Record<Status, string> = {
  'arriving-soon': '!bg-yellow-500/10 !text-yellow-500',
  'late': '!bg-red-500/10 !text-red-500',
  'no-show': '!bg-gray-500/10 !text-gray-500',
  'confirmed': '!bg-blue-500/10 !text-blue-500',
  'seated': '!bg-green-500/10 !text-green-500',
  'completed': '!bg-green-500/10 !text-green-500',
}


interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_visits: number
  joined_date: string
  reservation_id: string | null
}

interface Reservation {
  reservation_id: string
  reservation_time: string
  customer_email: string
  phone: string
  status: Status
  special_requests: string | null
  dietary_restrictions: string | null
  party_size: number
  customers: {
    name: string
    email: string
  } | null
}

const StatusBadge = ({ status }: { status: Status }) => (
  <Badge 
    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[status]}`}
  >
    {status}
  </Badge>
)


export function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getReservations()
      
      const transformedData = data.map(reservation => ({
        ...reservation,
        customers: reservation.customers || null
      }))
      
      console.log('Transformed data:', transformedData)
      setReservations(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching reservations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      console.log('🔄 Status change requested:', {
        id,
        newStatus,
        currentStatus: reservations.find(r => r.reservation_id === id)?.status
      })
  
      await updateReservationStatus(id, newStatus)
      
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.reservation_id === id 
            ? { ...reservation, status: newStatus }
            : reservation
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Status update failed:', {
        error: errorMessage,
        reservationId: id,
        attemptedStatus: newStatus,
        timestamp: new Date().toISOString()
      })
      setError(errorMessage)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <Table>
      <TableCaption>A list of reservations.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Customer Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Party Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Special Requests</TableHead>
          <TableHead>Dietary Restrictions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.reservation_id}>
            <TableCell>{reservation.customers?.name || '-'}</TableCell>
            <TableCell>{reservation.customer_email}</TableCell>
            <TableCell>{reservation.phone}</TableCell>
            <TableCell>{new Date(reservation.reservation_time).toLocaleString()}</TableCell>
            <TableCell>{reservation.party_size}</TableCell>
            <TableCell>
              <Select
                value={reservation.status}
                onValueChange={(value: Status) => {
                  console.log('Selected reservation ID:', reservation.reservation_id) // Debug log
                  handleStatusChange(reservation.reservation_id, value)
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <StatusBadge status={reservation.status} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusColors).map(([status, colorClass]) => (
                    <SelectItem key={status} value={status}>
                      <StatusBadge status={status as Status} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{reservation.special_requests || '-'}</TableCell>
            <TableCell>{reservation.dietary_restrictions || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
