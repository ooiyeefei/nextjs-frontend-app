"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Badge } from "../ui/badge"

type Status = 'reaching-soon' | 'late' | 'no-show' | 'confirmed' | 'seated'

interface Reservation {
  id: string
  customerName: string
  date: string
  time: string
  partySize: number
  status: Status
  specialRequests?: string
  dietaryRestrictions?: string
}

const statusColors: Record<Status, string> = {
  'reaching-soon': 'bg-yellow-500/10 text-yellow-500',
  'late': 'bg-red-500/10 text-red-500',
  'no-show': 'bg-gray-500/10 text-gray-500',
  'confirmed': 'bg-blue-500/10 text-blue-500',
  'seated': 'bg-green-500/10 text-green-500',
}

const initialReservations: Reservation[] = [
  {
    id: "1",
    customerName: "John Doe",
    date: "2024-01-15",
    time: "19:00",
    partySize: 4,
    status: "confirmed",
    specialRequests: "Window seat",
    dietaryRestrictions: "Nut allergy",
  },
  {
    id: "2",
    customerName: "Jane Smith",
    date: "2024-01-15",
    time: "20:30",
    partySize: 2,
    status: "reaching-soon",
    dietaryRestrictions: "Vegetarian",
  },
  {
    id: "3",
    customerName: "Bob Johnson",
    date: "2024-01-15",
    time: "18:00",
    partySize: 6,
    status: "seated",
    specialRequests: "Birthday celebration",
  },
]

export function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)

  const handleStatusChange = (id: string, newStatus: Status) => {
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id === id ? { ...reservation, status: newStatus } : reservation
      )
    )
  }

  return (
    <Table>
      <TableCaption>A list of reservations.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Customer Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Party Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Special Requests</TableHead>
          <TableHead>Dietary Restrictions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell>{reservation.customerName}</TableCell>
            <TableCell>{reservation.date}</TableCell>
            <TableCell>{reservation.time}</TableCell>
            <TableCell>{reservation.partySize}</TableCell>
            <TableCell>
              <Select
                value={reservation.status}
                onValueChange={(value: Status) => handleStatusChange(reservation.id, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    <Badge className={statusColors[reservation.status]}>
                      {reservation.status}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusColors).map(([status, colorClass]) => (
                    <SelectItem key={status} value={status}>
                      <Badge className={colorClass}>
                        {status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>{reservation.specialRequests || '-'}</TableCell>
            <TableCell>{reservation.dietaryRestrictions || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

