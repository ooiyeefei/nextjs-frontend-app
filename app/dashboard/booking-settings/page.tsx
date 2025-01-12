"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeeklySchedule } from "@/components/dashboard/weekly-schedule"
import { DateSpecificSchedule } from "@/components/dashboard/date-specific-schedule"
import { TableCapacitySettings } from "@/components/dashboard/table-capacity-settings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { getReservationSettings, updateReservationSettings } from "@/lib/supabase/queries"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"

export default function BookingOptionsPage() {
  const [timeSlotChunk, setTimeSlotChunk] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    timeSlotValue: 1,
    timeSlotUnit: "hours",
    minBookingValue: 1,
    minBookingUnit: "hours",
    maxBookingValue: 1,
    maxBookingUnit: "months",
    minCancelValue: 1,
    minCancelUnit: "hours",
    maxCancelValue: 1,
    maxCancelUnit: "days"
  })
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const settings = await getReservationSettings()
        console.log('Settings received:', settings)
        
        if (settings) {
          setFormData({
            timeSlotValue: settings.booking_timeslot?.timeslot?.value || 1,
            timeSlotUnit: settings.booking_timeslot?.timeslot?.unit || "hours",
            minBookingValue: settings.min_allowable_booking_time?.value || 1,
            minBookingUnit: settings.min_allowable_booking_time?.unit || "hours",
            maxBookingValue: settings.max_allowable_booking_time?.value || 1,
            maxBookingUnit: settings.max_allowable_booking_time?.unit || "months",
            minCancelValue: settings.min_allowable_cancellation_time?.value || 1,
            minCancelUnit: settings.min_allowable_cancellation_time?.unit || "hours",
            maxCancelValue: settings.max_allowable_cancellation_time?.value || 1,
            maxCancelUnit: settings.max_allowable_cancellation_time?.unit || "days"
          })
        }        
      } catch (error) {
        console.error('Error in fetchSettings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])
  

  const handleSubmit = async () => {
    try {
      await updateReservationSettings({
        timeslot_value: formData.timeSlotValue,
        timeslot_unit: formData.timeSlotUnit,
        min_booking_value: formData.minBookingValue,
        min_booking_unit: formData.minBookingUnit,
        max_booking_value: formData.maxBookingValue,
        max_booking_unit: formData.maxBookingUnit,
        min_cancel_value: formData.minCancelValue,
        min_cancel_unit: formData.minCancelUnit,
        max_cancel_value: formData.maxCancelValue,
        max_cancel_unit: formData.maxCancelUnit
      })
      toast({
        title: "Success",
        description: "Settings updated successfully",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Options</h1>
        <p className="text-muted-foreground mt-2">
          Configure your restaurant's availability and table capacity
        </p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          <h2 className="text-xl font-semibold mb-4">Booking Rules</h2>
          <div className="grid gap-6">
            <div className="space-y-4">
              <div>
                <Label>Booking Timeslot</Label>
                <div className="flex gap-4 items-center py-3">
                  <Input
                    type="number"
                    min="1"
                    value={formData.timeSlotValue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      timeSlotValue: parseInt(e.target.value) || 1
                    }))}
                    className="w-[130px]"
                  />
                  <Select 
                      value={formData.timeSlotUnit}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        timeSlotUnit: value
                      }))}
                    >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Minimum Allowable Booking Time</Label>
                <div className="flex gap-4 items-center py-3">
                  <Input
                    type="number"
                    min="1"
                    value={formData.minBookingValue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      minBookingValue: parseInt(e.target.value) || 1
                    }))}
                    className="w-[130px]"
                  />
                  <Select 
                    value={formData.minBookingUnit}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      minBookingUnit: value
                    }))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Maximum Allowable Booking Time</Label>
                <div className="flex gap-4 items-center py-3">
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxBookingValue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxBookingValue: parseInt(e.target.value) || 1
                    }))}
                    className="w-[130px]"
                  />
                  <Select 
                    value={formData.maxBookingUnit}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      maxBookingUnit: value
                    }))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Minimum Allowable Cancellation Time</Label>
                <div className="flex gap-4 items-center py-3">
                  <Input
                    type="number"
                    min="1"
                    value={formData.minCancelValue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      minCancelValue: parseInt(e.target.value) || 1
                    }))}
                    className="w-[130px]"
                  />
                  <Select 
                    value={formData.minCancelUnit}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      minCancelUnit: value
                    }))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Maximum Allowable Cancellation Time</Label>
                <div className="flex gap-4 items-center py-3">
                  <Input
                    type="number"
                    min="1"
                    value={formData.maxCancelValue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      maxCancelValue: parseInt(e.target.value) || 1
                    }))}
                    className="w-[130px]"
                  />
                  <Select 
                    value={formData.maxCancelUnit}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      maxCancelUnit: value
                    }))}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
          
              <div className="flex pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  type="submit"
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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