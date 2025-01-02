"use client"

import { useState } from "react"
import { ReservationsTab } from "@/components/dashboard/reservations-tab"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { CreateReservationModal } from "@/components/dashboard/create-reservation-modal"
import { CancelReservationModal } from "@/components/dashboard/cancel-reservation-modal"
import { EditReservationModal } from "@/components/dashboard/edit-reservation-modal"
import { Reservation } from "@/types"

export default function ReservationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)

  const handleCancelReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setCancelModalOpen(true)
  }

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setEditModalOpen(true)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservations</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Reservation
        </Button>
      </div>
      <ReservationsTab 
        onCancelReservation={handleCancelReservation}
        onEditReservation={handleEditReservation}
        />
      <CreateReservationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      <CancelReservationModal 
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        reservation={selectedReservation}
      />
      <EditReservationModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        reservation={selectedReservation}
      />
    </div>
  )
}
