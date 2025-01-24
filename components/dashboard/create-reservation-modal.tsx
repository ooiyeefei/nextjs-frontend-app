"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { X } from 'lucide-react'
import { calculateReservationTimeslots, createReservation } from "@/lib/supabase/queries"
import { toast } from "@/components/ui/toast"
import { CreateReservationData, CreateReservationModalProps, Status } from "@/types"
import { format } from "date-fns"

export function CreateReservationModal({ isOpen, onClose, onSuccess }: CreateReservationModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState<Status>('new')
  const [formData] = useState(new FormData());

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const [availableTimeslots, setAvailableTimeslots] = useState<Array<{start: string, end: string}>>([])
  const [selectedTimeslot, setSelectedTimeslot] = useState<string | null>(null)

  useEffect(() => {
    if (date) {
      calculateReservationTimeslots(date.toISOString())
        .then(slots => {
          setAvailableTimeslots(slots)
          setSelectedTimeslot(null)
        })
        .catch(error => {
          console.error('Failed to fetch timeslots:', error)
          toast({
            title: "Error",
            description: "Failed to load available timeslots",
            variant: "destructive"
          })
        })
    }
  }, [date])

  const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      const timeslotStart = formData.get('timeslot_start');
      const timeslotEnd = formData.get('timeslot_end');

      if (!date || !timeslotStart || !timeslotEnd) {
        toast({
          title: "Error",
          description: "Please select both date and time slot",
          variant: "destructive"
        })
        return;
      }

      const partySize = parseInt(formData.get('partySize') as string, 10);
      if (partySize < 1) {
        alert('Party size must be a positive number greater than 0.');
        return;
      }

      try {
        const reservationData: CreateReservationData = {
          customer_email: formData.get('email') as string,
          customer_name: formData.get('name') as string,
          customer_phone: formData.get('phone') as string,
          date: format(date, 'yyyy-MM-dd'),
          timeslot_start: formData.get('timeslot_start') as string,
          timeslot_end: formData.get('timeslot_end') as string,
          party_size: parseInt(formData.get('partySize') as string),
          status: status,
          special_requests: formData.get('special_requests') as string || null,
          dietary_restrictions: formData.get('dietary_restrictions') as string || null
        };

        console.log('Processed reservation data:', reservationData);
        const result = await createReservation(reservationData);
        console.log('Reservation creation result:', result);

        toast({
          title: "Success",
          description: "Reservation created successfully",
          variant: "success"
        });

        if (onSuccess) {
          await onSuccess();
        }

        window.location.reload();
        onClose();
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
        });
        toast({
          title: "Error",
          description: error.message || "Failed to create reservation",
          variant: "destructive"
        });
      }
  };
  

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
              <Input id="name" name="name" className="col-span-3" required aria-required="true"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" name="email" type="email" className="col-span-3" required aria-required="true"/>
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
                placeholder="Enter phone number (e.g., +65 1234 5678)"
                required
                aria-required="true"
                pattern="^[0-9\-\+\s\(\)]*$"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <div className="col-span-3">
                {date ? (
                  <div className="mb-2">
                    <Input 
                      readOnly
                      value={format(date, 'dd MMM yyyy (EEEE)')}
                      className="cursor-pointer"
                      onClick={() => setShowCalendar(true)}
                    />
                  </div>
                ) : null}
                {showCalendar && (
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
                        onSelect={(selectedDate) => {
                          setDate(selectedDate);
                          setShowCalendar(false);
                        }}
                        defaultMonth={currentMonth}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <div className="col-span-3">
                <Select 
                  value={selectedTimeslot || ''} 
                  onValueChange={(value) => {
                    setSelectedTimeslot(value);
                    const slot = availableTimeslots.find(s => s.start === value);
                    if (slot) {
                      formData.set('timeslot_start', slot.start);
                      formData.set('timeslot_end', slot.end);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeslots.map((slot, index) => (
                      <SelectItem key={index} value={slot.start}>
                        {`${slot.start} - ${slot.end}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="timeslot_start" value={selectedTimeslot || ''} />
                <input type="hidden" name="timeslot_end" value={
                  availableTimeslots.find(s => s.start === selectedTimeslot)?.end || ''
                } />
              </div>
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
