"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/toast"
import { cancelReservation } from "@/lib/supabase/queries"
import { CancelReservationModalProps } from "@/types"

export function CancelReservationModal({ isOpen, onClose, reservation }: CancelReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    if (!reservation) return
    
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    try {
      await Promise.all([
        cancelReservation(reservation.reservation_id),
        // Add a small delay to ensure toast is visible
        new Promise(resolve => setTimeout(resolve, 1000))
      ])

      toast({
        title: "Success",
        description: "Reservation has been cancelled",
        variant: "success"
      })
      
      setTimeout(() => {
        window.location.reload()
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to cancel reservation:', error)
      toast({
        title: "Error",
        description: "Failed to cancel reservation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Reservation</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-muted-foreground">
            Are you sure you want to cancel this reservation?
          </p>
          {reservation && (
            <div className="mt-4 space-y-2">
              <p><strong>Customer:</strong> {reservation.customers?.name}</p>
              <p><strong>Time:</strong> {new Date(reservation.reservation_time).toLocaleString()}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Reservation
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Reservation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
