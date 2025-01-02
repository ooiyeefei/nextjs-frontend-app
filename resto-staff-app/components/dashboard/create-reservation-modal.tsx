"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { X } from 'lucide-react'
import { createReservation } from "@/lib/supabase/queries"
import { toast } from "@/components/ui/toast"


type Status = 'arriving-soon' | 'late' | 'no-show' | 'confirmed' | 'seated' | 'completed'

interface CreateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => Promise<void>
}

export function CreateReservationModal({ isOpen, onClose, onSuccess }: CreateReservationModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState<Status>('confirmed')

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    console.log('Form Data:', {
      special_requests: formData.get('special_requests'),
      dietary_restrictions: formData.get('dietary_restrictions')
    })
    
    const partySize = parseInt(formData.get('partySize') as string, 10)
    if (partySize < 1) {
      alert('Party size must be a positive number greater than 0.')
      return
    }
  
    try {
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      // Format the timestamp correctly
      const reservationTime = new Date(`${date}T${time}`).toISOString()

      console.log('Form submission data:', {
        date,
        time,
        formattedTime: reservationTime,
        rawFormData: Object.fromEntries(formData.entries())
      })

      const reservationData = {
        customer_email: formData.get('email') as string,
        customer_name: formData.get('name') as string || null,
        phone: formData.get('phone') as string || null,
        reservation_time: reservationTime,
        status: status,
        special_requests: formData.get('special_requests') as string || null,
        dietary_restrictions: formData.get('dietary_restrictions') as string || null,
        party_size: partySize
      }

      console.log('Processed reservation data:', reservationData)
      const result = await createReservation(reservationData)
      console.log('Reservation creation result:', result)

      toast({
        title: "Success",
        description: "Reservation created successfully",
        variant: "success"
      })
      
      if (onSuccess) {
        await onSuccess()
      }     
      
      // Optionally refresh the reservations list
      window.location.reload()
      onClose()
    } catch (error: any) {
      console.error('Reservation creation failed:', {
        error: {
          name: error?.name,
          message: error?.message,
          status: error?.status,
          code: error?.code,
          details: error?.details,
          hint: error?.hint
        },
        formData: Object.fromEntries(formData.entries()),
        timestamp: new Date().toISOString()
      })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create reservation",
        variant: "destructive"
        })
    }
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                className="col-span-3"
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                <div className="flex justify-start">
                  <div className="w-[320px] sm:w-[350px]">
                    <input 
                      type="hidden" 
                      id="date" 
                      name="date" 
                      value={date ? date.toISOString().split('T')[0] : ''} 
                    />
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      defaultMonth={currentMonth}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                className="col-span-3 bg-white text-black border border-gray-300 rounded-md dark:bg-slate-800 dark:text-white dark:border-gray-600 [&::-webkit-calendar-picker-indicator]:dark:invert-[1]"
                required
            />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partySize" className="text-right">
                Party Size
              </Label>
              <Input 
                    id="partySize"
                    name="partySize"
                    type="number" 
                    min="1"
                    defaultValue="1"
                    onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value < 1) e.target.value = "1";
                      }}
                    className="col-span-3" 
                    required 
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <input 
                type="hidden" 
                name="status" 
                value={status} 
            />
              <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
                <SelectTrigger className="col-span-3 bg-white text-black dark:bg-slate-800 dark:text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arriving-soon">Arriving Soon</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="seated">Seated</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="special_requests" className="text-right">
                Special Requests
              </Label>
              <Textarea 
                id="special_requests" 
                name="special_requests"
                placeholder="Enter any special requests..."
                className="col-span-3" 
            />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dietary_restrictions" className="text-right">
                Dietary Restrictions
              </Label>
              <Textarea 
                    id="dietary_restrictions" 
                    name="dietary_restrictions"
                    placeholder="Enter any dietary restrictions..."
                    className="col-span-3" 
                />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Reservation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
