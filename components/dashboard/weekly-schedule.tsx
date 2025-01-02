"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Plus, X, Copy } from 'lucide-react'
import { TableAvailability } from "./table-availability"
import { TableType, TimeSlot, WeeklyScheduleState } from "types"
import { getTableTypes, updateWeeklySchedule } from "@/lib/supabase/queries"
import { toast } from "../ui/toast"

interface WeeklyScheduleProps {
  timeSlotChunk: number
}

export function WeeklySchedule({ timeSlotChunk }: WeeklyScheduleProps) {
  const [schedule, setSchedule] = useState<WeeklyScheduleState>({
    SUN: { enabled: false, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
    MON: { enabled: true, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
    TUE: { enabled: true, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
    WED: { enabled: true, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
    THU: { enabled: true, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
    FRI: { enabled: true, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
    SAT: { enabled: true, timeSlots: [{ start: "10:30", end: "20:30", tables: [] }] },
  })

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

  const addTimeSlot = (day: keyof WeeklyScheduleState) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, { start: "10:30", end: "20:30", tables: [] }]
      }
    }))
  }

  const removeTimeSlot = (day: keyof WeeklyScheduleState, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter((_, i) => i !== index)
      }
    }))
  }

  const updateTimeSlot = (
    day: keyof WeeklyScheduleState,
    index: number,
    field: keyof TimeSlot,
    value: any
  ) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const toggleDay = (day: keyof WeeklyScheduleState) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled
      }
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {(Object.keys(schedule) as Array<keyof WeeklyScheduleState>).map((day) => (
          <div key={day} className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-20 pt-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={schedule[day].enabled}
                  onCheckedChange={() => toggleDay(day)}
                />
                <label
                  htmlFor={`day-${day}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {day}
                </label>
              </div>
              <div className="flex-1 space-y-4">
                {schedule[day].enabled ? (
                  <>
                    {schedule[day].timeSlots.map((slot, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`time-start-${day}-${index}`}
                            name={`time-start-${day}-${index}`}
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                            className="w-32"
                          />
                          <span>-</span>
                          <Input
                            id={`time-end-${day}-${index}`}
                            name={`time-end-${day}-${index}`}
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                            className="w-32"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(day, index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === schedule[day].timeSlots.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => addTimeSlot(day)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <TableAvailability
                          tableTypes={tableTypes}
                          availabilities={slot.tables}
                          onAvailabilityChange={(tables) => updateTimeSlot(day, index, 'tables', tables)}
                          timeSlotChunk={timeSlotChunk}
                        />
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTimeSlot(day)}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Unavailable</div>
                )}
              </div>
              <Button variant="ghost" size="icon" className="mt-2">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button 
          className="mt-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
          onClick={async () => {
            try {
              await updateWeeklySchedule(schedule)
              toast({
                title: "Success",
                description: "Weekly schedule has been updated",
                variant: "success"
              })
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to update weekly schedule",
                variant: "destructive"
              })
              console.error(error)
            }
          }}
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  )
}

