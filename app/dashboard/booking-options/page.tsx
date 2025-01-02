"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeklySchedule } from "@/components/dashboard/weekly-schedule"
import { DateSpecificSchedule } from "@/components/dashboard/date-specific-schedule"
import { TableCapacitySettings } from "@/components/dashboard/table-capacity-settings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function BookingOptionsPage() {
  const [selectedTab, setSelectedTab] = useState("weekly")
  const [timeSlotChunk, setTimeSlotChunk] = useState(1) // Default chunk size is 2 hours

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Options</h1>
        <p className="text-muted-foreground mt-2">
          Configure your restaurant's availability and table capacity
        </p>
      </div>

      <div className="grid gap-4"> {/* Added grid container */}
        <div> {/* Time slot chunk input */}
          <Label htmlFor="timeSlotChunk">Time Slot Chunk (hours)</Label>
          <Input
            id="timeSlotChunk"
            type="number"
            min="1"
            value={timeSlotChunk}
            onChange={(e) => setTimeSlotChunk(parseInt(e.target.value, 10) || 1)}
          />
        </div>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Hours</TabsTrigger>
          <TabsTrigger value="specific">Date-Specific Hours</TabsTrigger>
          <TabsTrigger value="tables">Table Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklySchedule timeSlotChunk={timeSlotChunk} /> {/* Pass timeSlotChunk as prop */}
        </TabsContent>

        <TabsContent value="specific" className="space-y-4">
          <DateSpecificSchedule timeSlotChunk={timeSlotChunk} /> {/* Pass timeSlotChunk as prop */}
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TableCapacitySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

