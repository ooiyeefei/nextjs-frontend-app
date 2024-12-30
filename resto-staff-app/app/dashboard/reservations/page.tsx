"use client"

import { useState } from "react"
import { ReservationsTab } from "@/components/dashboard/reservations-tab"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { CreateReservationModal } from "@/components/dashboard/create-reservation-modal"


export default function ReservationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reservations</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Reservation
        </Button>
      </div>
      <ReservationsTab />
      <CreateReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

