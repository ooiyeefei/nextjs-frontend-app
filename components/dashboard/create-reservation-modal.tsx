'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X } from 'lucide-react'
import { toast } from "@/components/ui/toast"
import DatePicker from './date-picker'
import { BusinessProfileWithReservationSettings } from "@/types"

interface CreateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onReservationCreated?: () => Promise<void>
  restaurant: BusinessProfileWithReservationSettings
}

export function CreateReservationModal({
  isOpen,
  onClose,
  onReservationCreated,
  restaurant
}: CreateReservationModalProps) {

  const handleReservationComplete = async () => {
    toast({
      title: "Success",
      description: "Reservation created successfully",
      variant: "success"
    })

    if (onReservationCreated) {
      await onReservationCreated()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle>Create New Reservation</DialogTitle>
        </DialogHeader>

        <DatePicker
          restaurant={restaurant}
          operatingHours={restaurant.operating_hours as Record<string, string>}
          reservationSettings={restaurant.reservation_settings}
          isModifying={false}
          onModificationComplete={handleReservationComplete}
        />
      </DialogContent>
    </Dialog>
  )
}
