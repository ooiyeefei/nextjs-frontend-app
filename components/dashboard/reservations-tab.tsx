"use client"

import { useEffect, useState } from "react"
import { getReservations, updateReservationStatus } from "@/lib/supabase/queries"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Status, Reservation, statusColors, ReservationsTabProps } from "@/types"

const StatusBadge = ({ status }: { status: Status }) => (
  <Badge 
    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status]}`}
  >
    {status}
  </Badge>
)

export function ReservationsTab({ onCancelReservation, onEditReservation }: ReservationsTabProps) {
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
          <TableHead>Actions</TableHead>
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
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onEditReservation(reservation)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onCancelReservation(reservation)}
                >
                  Cancel
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
