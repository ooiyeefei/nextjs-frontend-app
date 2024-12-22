"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"
import { Checkbox } from "../../../components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

interface DaySchedule {
  isOpen: boolean
  openTime: string
  closeTime: string
}

type WeekSchedule = Record<string, DaySchedule>

export default function ProfilePage() {
  const [schedule, setSchedule] = useState<WeekSchedule>(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: true,
        openTime: "09:00",
        closeTime: "22:00",
      },
    }), {})
  )

  const handleScheduleChange = (
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const handleSaveHours = () => {
    console.log('Saving hours:', schedule)
    // Add your save logic here
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-8">Restaurant Profile</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input type="text" id="restaurantName" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input type="tel" id="phone" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" />
              </div>
              <Button 
                type="submit"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-40 flex items-center gap-2">
                    <Checkbox
                      id={`${day}-open`}
                      checked={schedule[day].isOpen}
                      onCheckedChange={(checked) =>
                        handleScheduleChange(day, 'isOpen', checked)
                      }
                    />
                    <Label htmlFor={`${day}-open`}>{day}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select
                      value={schedule[day].openTime}
                      onValueChange={(value) =>
                        handleScheduleChange(day, 'openTime', value)
                      }
                      disabled={!schedule[day].isOpen}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Opening" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span>to</span>

                    <Select
                      value={schedule[day].closeTime}
                      onValueChange={(value) =>
                        handleScheduleChange(day, 'closeTime', value)
                      }
                      disabled={!schedule[day].isOpen}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Closing" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={handleSaveHours}
                className="mt-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
              >
                Save Hours
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the profile sections remain unchanged */}
      </div>
    </div>
  )
}

