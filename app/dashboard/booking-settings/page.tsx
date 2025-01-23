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
import { getBusinessProfile, getReservationSettings, updateReservationSettings } from "@/lib/supabase/queries"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import { BookingSettings } from "@/types"

export default function BookingOptionsPage() {
  const [timeSlotChunk, setTimeSlotChunk] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<BookingSettings | null>(null)
  const [formData, setFormData] = useState({
    timeslot_length_minutes: 60, // From reservation_settings
    min_allowed_booking_advance_hours: 3, // From business_profiles
    max_allowed_booking_advance_hours: 336, // From business_profiles (14 days)
    allowed_cancellation_hours: 3 // From business_profiles
  })
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const settings = await getReservationSettings()
        console.log('Settings received:', settings)
        setSettings(settings)

        const defaultSetting = settings.settings[0]
        
        setFormData({
          timeslot_length_minutes: defaultSetting?.timeslot_length_minutes,
          min_allowed_booking_advance_hours: settings.min_allowed_booking_advance_hours,
          max_allowed_booking_advance_hours: settings.max_allowed_booking_advance_hours,
          allowed_cancellation_hours: settings.allowed_cancellation_hours
        })
      } catch (error) {
        console.error('Error in fetchSettings:', error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchSettings()
  }, [])
  

  const handleSubmit = async () => {
    try {
      await updateReservationSettings({
        timeslot_length_minutes: formData.timeslot_length_minutes,
        min_allowed_booking_advance_hours: formData.min_allowed_booking_advance_hours,
        max_allowed_booking_advance_hours: formData.max_allowed_booking_advance_hours,
        allowed_cancellation_hours: formData.allowed_cancellation_hours
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
              <Label>Booking Timeslot (minutes)</Label>
              <div className="flex gap-4 items-center py-3">
                <Input
                  type="number"
                  min="30"
                  max="240"
                  value={formData.timeslot_length_minutes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    timeslot_length_minutes: parseInt(e.target.value) || 60
                  }))}
                  className="w-[130px]"
                />
              </div>
            </div>

            <div>
              <Label>Minimum Advance Booking (hours)</Label>
              <Input
                type="number"
                min="1"
                value={formData.min_allowed_booking_advance_hours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  min_allowed_booking_advance_hours: parseInt(e.target.value) || 3
                }))}
                className="w-[130px]"
              />
            </div>

            <div>
              <Label>Maximum Advance Booking (hours)</Label>
              <Input
                type="number"
                min="1"
                value={formData.max_allowed_booking_advance_hours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  max_allowed_booking_advance_hours: parseInt(e.target.value) || 336
                }))}
                className="w-[130px]"
              />
            </div>

            <div>
              <Label>Cancellation Time (hours)</Label>
              <Input
                type="number"
                min="1"
                value={formData.allowed_cancellation_hours}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  allowed_cancellation_hours: parseInt(e.target.value) || 3
                }))}
                className="w-[130px]"
              />
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
          <WeeklySchedule 
            timeSlotChunk={timeSlotChunk} 
            settings={settings?.settings || []}
          /> {/* Pass timeSlotChunk as prop */}
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