"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { CreateReservationModal } from "@/components/dashboard/create-reservation-modal"
import { CancelReservationModal } from "@/components/dashboard/cancel-reservation-modal"
import { EditReservationModal } from "@/components/dashboard/edit-reservation-modal"
import { Status, Reservation, statusColors, ReservationsTabProps } from "@/types"
import { getReservations, updateReservationStatus } from "@/lib/supabase/queries"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"

const StatusBadge = ({ status }: { status: Status }) => (
  <Badge 
    className={cn(
      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white",
      {
        'bg-yellow-500': status === 'arriving-soon',
        'bg-red-500': status === 'late',
        'bg-gray-500': status === 'no-show',
        'bg-blue-500': status === 'confirmed',
        'bg-green-500': status === 'seated' || status === 'completed'
      }
    )}
  >
    {status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')}
  </Badge>
)

type SortConfig = {
  key: string | null;  // Allow both string and null
  direction: 'asc' | 'desc';  // Restrict direction to literal types
}

type ReservationData = {
  reservation_id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  reservation_time: string;
  party_size: number;
  status: Status;
  special_requests: string | null;
  dietary_restrictions: string | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

export default function ReservationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([])
  const [pastReservations, setPastReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeSortConfig, setActiveSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });
  
  const [pastSortConfig, setPastSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc'
  });
  
  const StatusCell = ({ reservationId, status }: { reservationId: string, status: Status }) => (
    <div className="flex justify-center">
      <Select 
        value={status} 
        onValueChange={(value) => handleStatusChange(reservationId, value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue>
            <StatusBadge status={status} />
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {['arriving-soon', 'late', 'no-show', 'confirmed', 'seated', 'completed'].map((value) => (
            <SelectItem 
              key={value} 
              value={value}
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2"
            >
              <StatusBadge status={value as Status} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const sortData = (data: ReservationData[], sortConfig: SortConfig) => {
      if (!sortConfig.key) return data;
    
      return [...data].sort((a, b) => {
        if (sortConfig.key === 'reservation_time') {
          const dateA = new Date(a[sortConfig.key]).getTime();
          const dateB = new Date(b[sortConfig.key]).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
    
        const aValue = a[sortConfig.key as keyof Reservation] ?? '';
        const bValue = b[sortConfig.key as keyof Reservation] ?? '';
    
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
    
        return sortConfig.direction === 'asc'
          ? (aValue < bValue ? -1 : 1)
          : (bValue < aValue ? -1 : 1);
      });
    }
    
    const requestActiveSort = (key: string) => {
      setActiveSortConfig((prevConfig: SortConfig) => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
      }));
    }
    
    const requestPastSort = (key: string) => {
      setPastSortConfig((prevConfig: SortConfig) => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc',
      }));
    }


  const handleCancelReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setCancelModalOpen(true)
  }

  const handleEditReservation = (reservation: Reservation) => {
    console.log('Editing reservation:', reservation) // For debugging
    setSelectedReservation(reservation)
    setEditModalOpen(true)
  }

  const fetchReservations = async () => {
    try {
      setIsLoading(true)
      const reservations = await getReservations()
      const now = new Date()
      const updates: Promise<any>[] = []
  
      // Process each reservation and prepare updates if needed
      const processedReservations = reservations.map(res => {
        const reservationTime = new Date(res.reservation_time)
        // Add 15 minutes grace period
        const graceTime = new Date(reservationTime.getTime() + 15 * 60000)
        
        if (now > graceTime) {
          // If past grace time and not already marked as completed or no-show
          if (res.status !== 'completed' && res.status !== 'no-show') {
            let newStatus: Status
            
            // If status is 'confirmed' or 'arriving-soon', mark as no-show
            if (['confirmed', 'arriving-soon', 'late'].includes(res.status)) {
              newStatus = 'no-show'
            } 
            // If status is 'seated', mark as completed
            else if (['seated'].includes(res.status)) {
              newStatus = 'completed'
            }
            // Keep existing status if already no-show or completed
            else {
              newStatus = res.status as Status
            }
  
            // Queue the update
            updates.push(updateReservationStatus(res.reservation_id, newStatus))
            // Return reservation with new status
            return { ...res, status: newStatus }
          }
        }
        return res
      })
  
      // Execute all updates in parallel if any
      if (updates.length > 0) {
        await Promise.all(updates)
      }
  
      // Filter processed reservations into active and past
      const active = processedReservations.filter(res => 
        new Date(res.reservation_time) > now && 
        !['completed', 'no-show'].includes(res.status)
      )
  
      const past = processedReservations.filter(res => 
        new Date(res.reservation_time) <= now || 
        ['completed', 'no-show'].includes(res.status)
      )
  
      setActiveReservations(active)
      setPastReservations(past)
    } catch (error) {
      console.error("Error fetching reservations:", error)
    } finally {
      setIsLoading(false)
    }
  }  
  
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateReservationStatus(id, newStatus)
      await fetchReservations()
    } catch (error) {
      console.error("Error updating reservation status:", error)
    }
  }  

  useEffect(() => {
    fetchReservations()
    const intervalId = setInterval(fetchReservations, 60000) // Check every minute
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservations</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Reservation
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4 py-6">Active Reservations</h2>
            <Table>
              <TableHeader>
                <TableRow>
         {[
           { key: 'customer_name', label: 'Customer Name' },
           { key: 'customer_email', label: 'Email' },
           { key: 'phone', label: 'Phone' },
           { key: 'reservation_time', label: 'Date & Time' },
           { key: 'party_size', label: 'Party Size' },
           { key: 'status', label: 'Status' },
           { key: 'special_requests', label: 'Special Requests' },
           { key: 'dietary_restrictions', label: 'Dietary Restrictions' },
           { key: 'actions', label: 'Actions' }
         ].map(column => (
           <TableHead
             key={column.key}
             className="text-center py-6 px-3 cursor-pointer hover:bg-accent/50"
             onClick={() => requestActiveSort(column.key)}
           >
             <div className="flex items-center justify-center gap-2">
               {column.label}
               {activeSortConfig.key === column.key && (
                  <span>{activeSortConfig.direction === 'asc' ? '🔼' : '🔽'}</span>
                )}
             </div>
           </TableHead>
         ))}
                </TableRow>
              </TableHeader>
              <TableBody>
         {sortData(activeReservations, activeSortConfig).map((reservation) => (
           <TableRow key={reservation.reservation_id}>
             <TableCell>{reservation.customer_name ?? reservation.customers?.name ?? '-'}</TableCell>
             <TableCell>{reservation.customer_email}</TableCell>
             <TableCell>{reservation.phone}</TableCell>
             <TableCell>{format(new Date(reservation.reservation_time), 'PPp')}</TableCell>
             <TableCell>{reservation.party_size}</TableCell>
             <TableCell>
              <StatusCell 
                  reservationId={reservation.reservation_id} 
                  status={reservation.status} 
                />
             </TableCell>
             <TableCell>{reservation.special_requests}</TableCell>
             <TableCell>{reservation.dietary_restrictions}</TableCell>
             <TableCell className="text-center">
              <div className="flex justify-center gap-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleEditReservation(reservation)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelReservation(reservation)}
                >
                  Cancel
                </Button>
              </div>
            </TableCell>
           </TableRow>
         ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      
        <Card>
          <CardContent>
            <h2 className="text-2xl font-semibold mb-4 py-6">Past Reservations</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    { key: 'customer_name', label: 'Customer Name' },
                    { key: 'customer_email', label: 'Email' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'reservation_time', label: 'Date & Time' },
                    { key: 'party_size', label: 'Party Size' },
                    { key: 'status', label: 'Status' },
                    { key: 'special_requests', label: 'Special Requests' },
                    { key: 'dietary_restrictions', label: 'Dietary Restrictions' },
                    { key: 'actions', label: 'Actions' }
                  ].map(column => (
                    <TableHead
                      key={column.key}
                      className="text-center py-6 px-3 cursor-pointer hover:bg-accent/50"
                      onClick={() => requestPastSort(column.key)}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {column.label}
                        {pastSortConfig.key === column.key && (
                          <span>{pastSortConfig.direction === 'asc' ? '🔼' : '🔽'}</span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortData(pastReservations, pastSortConfig).map((reservation) => (
                  <TableRow key={reservation.reservation_id}>
                    <TableCell>{reservation.customer_name ?? reservation.customers?.name ?? '-'}</TableCell>
                    <TableCell>{reservation.customer_email}</TableCell>
                    <TableCell>{reservation.phone}</TableCell>
                    <TableCell>{format(new Date(reservation.reservation_time), 'PPp')}</TableCell>
                    <TableCell>{reservation.party_size}</TableCell>
                    <TableCell>
                      <StatusCell 
                        reservationId={reservation.reservation_id} 
                        status={reservation.status} 
                      />
                    </TableCell>
                    <TableCell>{reservation.special_requests ?? '-'}</TableCell>
                    <TableCell>{reservation.dietary_restrictions ?? '-'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEditReservation(reservation)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      <CreateReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onReservationCreated={fetchReservations}
      />
      <CancelReservationModal 
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        reservation={selectedReservation}
        onReservationCancelled={fetchReservations}
      />
      {selectedReservation && editModalOpen && (
        <EditReservationModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false)
            setSelectedReservation(null)
          }}
          reservation={selectedReservation}
          onReservationUpdated={fetchReservations}
        />
      )}
    </div>
  </div>
  )
}