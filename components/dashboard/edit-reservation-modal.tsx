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
import { createReservation } from "@/lib/supabase/queries"
import { toast } from "@/components/ui/toast"
import { EditReservationModalProps, Status } from "@/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Portal } from "@radix-ui/react-portal"

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

export function EditReservationModal({ isOpen, onClose,reservation, onSuccess, onReservationUpdated }: EditReservationModalProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [status, setStatus] = useState<Status>(reservation.status)
  const [showCalendar, setShowCalendar] = useState(false)
  const [formData, setFormData] = useState({
    name: reservation.customer_name || reservation.customers?.name || '',
    email: reservation.customer_email,
    phone: reservation.phone,
    party_size: reservation.party_size,
    special_requests: reservation.special_requests || '',
    dietary_restrictions: reservation.dietary_restrictions || ''
  })

  // Update form data when reservation changes
  useEffect(() => {
    setDate(new Date(reservation.reservation_time))
    setStatus(reservation.status)
    setFormData({
      name: reservation.customer_name || reservation.customers?.name || '',
      email: reservation.customer_email,
      phone: reservation.phone || '',
      party_size: reservation.party_size,
      special_requests: reservation.special_requests || '',
      dietary_restrictions: reservation.dietary_restrictions || ''
    })
  }, [reservation])

  const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
      
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      // Check for required fields
      const email = formData.get('email');
      const name = formData.get('name');
      const phone = formData.get('phone');
      if (!email || !name || !phone) {
        throw new Error('Required fields are missing');
      }

      // Log form data for debugging
      console.log('Form Data:', {
        email,
        name,
        phone,
        special_requests: formData.get('special_requests'),
        dietary_restrictions: formData.get('dietary_restrictions'),
        partySize: formData.get('partySize'),
        date: formData.get('date'),
        time: formData.get('time')
      });

      const partySize = parseInt(formData.get('partySize') as string, 10);
      if (partySize < 1) {
        alert('Party size must be a positive number greater than 0.');
        return;
      }

      try {
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const reservationTime = new Date(`${date}T${time}`).toISOString();

        const reservationData = {
          customer_email: email as string,
          customer_name: name as string || null,
          phone: formData.get('phone') as string || null,
          reservation_time: reservationTime,
          status: status,
          special_requests: formData.get('special_requests') as string || null,
          dietary_restrictions: formData.get('dietary_restrictions') as string || null,
          party_size: partySize
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
          <DialogTitle>Edit Reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={formData.name}
                className="col-span-3" 
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3" 
                required 
                aria-required="true"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
                placeholder="Enter phone number"
                required
                aria-required="true"
                pattern="[0-9]{8,}"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
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
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setShowCalendar(false);
                    }}
                    className="rounded-md border"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={format(new Date(reservation.reservation_time), 'HH:mm')}
                onChange={(e) => {
                  const newDate = new Date(date!);
                  const [hours, minutes] = e.target.value.split(':');
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setDate(newDate);
                }}
                className="col-span-3 bg-white text-black border border-gray-300 rounded-md dark:bg-slate-800 dark:text-white dark:border-gray-600 [&::-webkit-calendar-picker-indicator]:dark:invert-[1]"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="partySize" className="text-right">Party Size</Label>
              <Input 
                id="partySize"
                name="partySize"
                type="number" 
                min="1"
                value={formData.party_size}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({ ...formData, party_size: value < 1 ? 1 : value });
                }}
                className="col-span-3" 
                required 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select 
                value={status}
                onValueChange={(value) => setStatus(value as Status)}
              >
                <SelectTrigger className="col-span-3 bg-white text-black dark:bg-slate-800 dark:text-white">
                  <SelectValue>
                    <StatusBadge status={status} />
                  </SelectValue>
                </SelectTrigger>
                <Portal>
                  <SelectContent 
                    position="popper" 
                    sideOffset={5}
                    className="z-[1000] w-[200px]"
                  >
                    {['arriving-soon', 'late', 'no-show', 'confirmed', 'seated', 'completed'].map((value) => (
                      <SelectItem 
                        key={value} 
                        value={value}
                      >
                        <StatusBadge status={value as Status} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Portal>
              </Select>

            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="special_requests" className="text-right">Special Requests</Label>
              <Textarea 
                id="special_requests" 
                name="special_requests"
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                placeholder="Enter any special requests..."
                className="col-span-3" 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dietary_restrictions" className="text-right">Dietary Restrictions</Label>
              <Textarea 
                id="dietary_restrictions" 
                name="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={(e) => setFormData({ ...formData, dietary_restrictions: e.target.value })}
                placeholder="Enter any dietary restrictions..."
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Update Reservation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
