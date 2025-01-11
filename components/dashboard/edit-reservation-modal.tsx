"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/toast"
import { updateReservation } from "@/lib/supabase/queries"
import { EditReservationModalProps, Status, statusColors } from "@/types"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

export function EditReservationModal({ isOpen, onClose, reservation }: EditReservationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    reservation ? new Date(reservation.reservation_time) : undefined
  )
  const [status, setStatus] = useState<Status>(
    (reservation?.status as Status) || 'confirmed'
  )
  const [partySize, setPartySize] = useState<number>(
    reservation?.party_size || 1
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Form submitted');
    if (!reservation || !date) {
      toast({
        title: "Error",
        description: "Please provide a valid reservation date.",
        variant: "destructive",
      });
      return;
    }
    
    // Combine date and time
    const formData = new FormData(event.target as HTMLFormElement);
    const timeString = formData.get('time') as string;
    const [hours, minutes] = timeString.split(':');
    const reservationTime = new Date(date);
    reservationTime.setHours(parseInt(hours), parseInt(minutes));

    // Check if reservation time is in the past
    if (reservationTime < new Date()) {
      toast({
        title: "Error",
        description: "Reservation date and time cannot be in the past.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const updatedData = {
        customer_email: formData.get('email') as string,
        customer_name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        reservation_time: reservationTime.toISOString(),
        status: status,
        special_requests: formData.get('special_requests') as string,
        dietary_restrictions: formData.get('dietary_restrictions') as string,
        party_size: partySize
      }

      console.log('Calling updateReservation with:', reservation.reservation_id, updatedData);
      await updateReservation(reservation.reservation_id, updatedData)
      
      toast({
        title: "Success",
        description: "Reservation updated successfully",
        variant: "success"
      })
      
      window.location.reload()
      onClose()
    } catch (error) {
      console.error('Failed to update reservation:', error)
      toast({
        title: "Error",
        description: "Failed to update reservation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!reservation) return null

  const currentTime = new Date(reservation.reservation_time)
  const timeString = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <div className="sticky top-0 bg-background z-10">
              <DialogTitle>Edit Reservation</DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <Input 
                  name="name"
                  defaultValue={reservation.customers?.name || ''}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <Input 
                  name="email"
                  type="email"
                  defaultValue={reservation.customer_email}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phone</Label>
                <Input 
                  name="phone"
                  defaultValue={reservation.phone}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Date</Label>
                <div className="col-span-3">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Time</Label>
                <Input 
                  name="time"
                  type="time"
                  defaultValue={timeString}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Party Size</Label>
                <Input 
                  name="party_size"
                  type="number"
                  min="1"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value))}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue>
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
                        {status
                          .split('-')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusColors).map(([value, colorClass]) => (
                      <SelectItem
                        key={value}
                        value={value}
                        className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 hover:bg-opacity-80"
                      >
                        <Badge
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white w-full",
                            colorClass // Apply dynamic color
                          )}
                        >
                          {value
                            .split('-')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Special Requests</Label>
                <Textarea 
                  name="special_requests"
                  defaultValue={reservation.special_requests || ''}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dietary Restrictions</Label>
                <Textarea 
                  name="dietary_restrictions"
                  defaultValue={reservation.dietary_restrictions || ''}
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter className="sticky bottom-0 bg-background z-10 px-8">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Reservation"}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  )
}
