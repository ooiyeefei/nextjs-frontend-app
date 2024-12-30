"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from 'lucide-react'
import { TableAvailability } from "./table-availability"
import { TableType } from "./table-capacity-settings"
import { getDateSpecificSchedule, getTableTypes, updateDateSpecificSchedule } from "@/lib/supabase/queries"
import { toast } from "../ui/toast"

interface TableAvailability {
  tableTypeId: string;
  tableTypeName: string;
  quantity: number;
}


interface TimeSlot {
  start: string
  end: string
  tables: TableAvailability[]
}

interface DateSchedule {
  date: Date
  timeSlots: TimeSlot[]
}

export function DateSpecificSchedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [dateSchedules, setDateSchedules] = useState<DateSchedule[]>([])

  const [tableTypes, setTableTypes] = useState<TableType[]>([])
    useEffect(() => {
      async function fetchTableTypes() {
        try {
          const types = await getTableTypes()
          setTableTypes(types)
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load table types",
            variant: "destructive"
          })
          console.error(error)
        }
      }
      fetchTableTypes()
    }, [])
  

  const handleSaveChanges = async () => {
    if (!selectedDate) return
    
    const currentSchedule = getCurrentDateSchedule()
    if (!currentSchedule) return

    try {
      await updateDateSpecificSchedule(currentSchedule)
      toast({
        title: "Success",
        description: "Date-specific schedule has been updated",
        variant: "success"
      })
    } catch (error) {
      console.error('Failed to save changes:', error)
      toast({
        title: "Error",
        description: "Failed to update date-specific schedule",
        variant: "destructive"
      })
    }
  }
  
  const addTimeSlot = (date: Date) => {
    setDateSchedules(prev => {
      const existingSchedule = prev.find(
        schedule => format(schedule.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      )

      if (existingSchedule) {
        return prev.map(schedule =>
          schedule === existingSchedule
            ? {
                ...schedule,
                timeSlots: [...schedule.timeSlots, { start: "10:30", end: "20:30", tables: [] }]
              }
            : schedule
        )
      }

      return [...prev, { 
        date, 
        timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] 
      }]
    })
  }

  const removeTimeSlot = (date: Date, index: number) => {
    setDateSchedules(prev =>
      prev.map(schedule =>
        format(schedule.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.filter((_, i) => i !== index)
            }
          : schedule
      )
    )
  }

  const updateTimeSlot = (
    date: Date,
    index: number,
    field: keyof TimeSlot,
    value: any
  ) => {
    setDateSchedules(prev =>
      prev.map(schedule =>
        format(schedule.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          ? {
              ...schedule,
              timeSlots: schedule.timeSlots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              )
            }
          : schedule
      )
    )
  }

  const getCurrentDateSchedule = () => {
    if (!selectedDate) return null
    return dateSchedules.find(
      schedule => format(schedule.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )
  }

  const loadDateSchedule = async (date: Date) => {
    try {
      const schedule = await getDateSpecificSchedule(date)
      if (schedule) {
        setDateSchedules(prev => 
          [...prev.filter(s => format(s.date, 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')), schedule]
        )
      }
    } catch (error) {
      console.error('Failed to load date schedule:', error)
      // Add error handling UI feedback here
    }
  }


  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Select Dates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="w-[320px] sm:w-[350px]"> {/* Fixed width container */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                if (date) loadDateSchedule(date)
              }}
              className="rounded-md border"
            />
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>
          {selectedDate
            ? `Hours for ${format(selectedDate, 'MMMM d, yyyy')}`
            : 'Select a date to set hours'}
        </CardTitle>
      </CardHeader>
      <CardContent>
          {selectedDate && (
            <div className="space-y-4">
              {(getCurrentDateSchedule()?.timeSlots || []).map((slot, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateTimeSlot(selectedDate, index, 'start', e.target.value)
                      }
                      className="w-32"
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateTimeSlot(selectedDate, index, 'end', e.target.value)
                      }
                      className="w-32"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeSlot(selectedDate, index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <TableAvailability
                    tableTypes={tableTypes}
                    availabilities={slot.tables}
                    onAvailabilityChange={(tables) => 
                      updateTimeSlot(selectedDate, index, 'tables', tables)
                    }
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addTimeSlot(selectedDate)}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Time Slot
              </Button>
              <Button 
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                onClick={handleSaveChanges}
              >
                Apply Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

