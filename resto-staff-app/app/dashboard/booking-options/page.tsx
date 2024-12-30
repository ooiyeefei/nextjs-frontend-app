"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeklySchedule } from "@/components/dashboard/weekly-schedule"
import { DateSpecificSchedule } from "@/components/dashboard/date-specific-schedule"
import { TableCapacitySettings } from "@/components/dashboard/table-capacity-settings"

export default function BookingOptionsPage() {
  const [selectedTab, setSelectedTab] = useState("weekly")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Options</h1>
        <p className="text-muted-foreground mt-2">
          Configure your restaurant's availability and table capacity
        </p>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Hours</TabsTrigger>
          <TabsTrigger value="specific">Date-Specific Hours</TabsTrigger>
          <TabsTrigger value="tables">Table Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <WeeklySchedule />
        </TabsContent>

        <TabsContent value="specific" className="space-y-4">
          <DateSpecificSchedule />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TableCapacitySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

