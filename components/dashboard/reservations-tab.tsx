"use client"

import { useEffect, useState } from "react"
import { getReservations, updateReservationStatus } from "@/lib/supabase/queries"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Status, Reservation, statusColors, ReservationsTabProps } from "@/types"
import { ChevronRight, PlusCircle } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"

const StatusBadge = ({ status }: { status: Status }) => (
  <Badge 
    className={cn(
      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
      statusColors[status]
    )}
  >
    {status}
  </Badge>
)

export function ReservationsTab({ onCancelReservation, onEditReservation }: ReservationsTabProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center py-6 px-3">Customer Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Phone</TableHead>
              <TableHead className="text-center">Date & Time</TableHead>
              <TableHead className="text-center">Party Size</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Special Requests</TableHead>
              <TableHead className="text-center">Dietary Restrictions</TableHead>
              <TableHead className="text-center w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((reservation, index) => (
              <TableRow 
                key={reservation.reservation_id}
                className={`
                  cursor-pointer 
                  transition-colors 
                  hover:bg-accent/60
                  group
                  ${index % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/40'}
                `}
                >
                <TableCell className="text-center">{reservation.customers?.name || '-'}</TableCell>
                <TableCell className="text-center">{reservation.customer_email}</TableCell>
                <TableCell className="text-center">{reservation.phone}</TableCell>
                <TableCell className="text-center">{new Date(reservation.reservation_time).toLocaleString()}</TableCell>
                <TableCell className="text-center">{reservation.party_size}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Select
                      value={reservation.status}
                      onValueChange={(value: Status) => {
                        console.log('Selected reservation ID:', reservation.reservation_id) // Debug log
                        handleStatusChange(reservation.reservation_id, value)
                      }}
                    >
                      <SelectTrigger className="w-[140px] bg-transparent">
                        <SelectValue>
                          <StatusBadge status={reservation.status} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-transparent">
                        {Object.entries(statusColors).map(([status, colorClass]) => (
                          <SelectItem key={status} value={status} className="bg-transparent">
                            <StatusBadge status={status as Status} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell className="text-center">{reservation.special_requests || '-'}</TableCell>
                <TableCell className="text-center">{reservation.dietary_restrictions || '-'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-3">
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
                <TableCell className="text-center">
                  <ChevronRight 
                    className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </CardContent>
    </Card>
  )
}
