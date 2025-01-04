"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"
import { Checkbox } from "../../../components/ui/checkbox"
import Image from 'next/image'
import { getBusinessLogoUrl, getBusinessProfile, uploadBusinessLogo, upsertBusinessProfile } from "@/lib/supabase/queries"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { toast } from "@/components/ui/toast"
import { UploadButton } from "@/components/ui/upload-button"

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
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
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

  const [formData, setFormData] = useState({
    restaurantName: "",
    phone: "",
    website: "",
    address: "",
    cancellationPolicy: "",
    refundPolicy: "",
    dataUsageDisclaimer: ""
  })

  // Load initial data
  useEffect(() => {
    const defaultSchedule = DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: {
        isOpen: true,
        openTime: "09:00",
        closeTime: "22:00",
      },
    }), {})
  
    const loadProfile = async () => {
      try {
        const profile = await getBusinessProfile();
        if (profile) {
          // Profile exists, set form data
          setFormData({
            restaurantName: profile['restaurant-name'] || "",
            phone: profile.phone || "",
            website: profile.website || "",
            address: profile.address || "",
            cancellationPolicy: profile.cancellation_policy || "",
            refundPolicy: profile.refund_policy || "",
            dataUsageDisclaimer: profile.data_usage_disclaimer || ""
          });
          setSchedule(profile.operating_hours || defaultSchedule);
  
          // Load logo URL
          const logoUrl = await getBusinessLogoUrl();
          if (logoUrl) {
            setLogoUrl(logoUrl);
          }
        } else {
          // No profile exists yet, set default empty state
          setFormData({
            restaurantName: "",
            phone: "",
            website: "",
            address: "",
            cancellationPolicy: "",
            refundPolicy: "",
            dataUsageDisclaimer: ""
          });
          setSchedule(defaultSchedule);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };
  
    loadProfile();
  }, []);
  
  

  const isValidWebsite = (url: string): boolean => {
    if (!url) return true // Allow empty website
    
    // Remove any leading/trailing whitespace
    url = url.trim()
    
    // If URL doesn't start with http://, https://, or www., add https://
    if (!url.match(/^(https?:\/\/|www\.)/i)) {
      url = 'https://' + url
    }
    
    try {
      // If starts with www., add https://
      if (url.startsWith('www.')) {
        url = 'https://' + url
      }
      
      // Try to construct a URL object - this validates the URL format
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const [websiteError, setWebsiteError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    
    if (id === 'website') {
      setWebsiteError("")
      if (value && !isValidWebsite(value)) {
        setWebsiteError("Please enter a valid website URL (e.g., example.com, www.example.com, or https://example.com)")
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setLogoFile(event.target.files[0])
    }
  }

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const profileData = {
        'restaurant-name': formData.restaurantName,  // Required field
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        'operating-hours': schedule,
        'capacity_info': null,
        cancellation_policy: formData.cancellationPolicy,
        refund_policy: formData.refundPolicy,
        data_usage_disclaimer: formData.dataUsageDisclaimer
      }
      
      await upsertBusinessProfile(profileData)
      
      if (logoFile) {
        await uploadBusinessLogo(logoFile)
      }

      toast({
        title: "Success",
        description: "General information has been updated",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update general information",
        variant: "destructive"
      })
      console.error('Failed to save profile:', error)
    } finally {
      setLoading(false)
    }
  }
  

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

  const handleSavePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const profileData = {
        'restaurant-name': formData.restaurantName, // Required field
        cancellation_policy: formData.cancellationPolicy,
        refund_policy: formData.refundPolicy,
        data_usage_disclaimer: formData.dataUsageDisclaimer
      };
      
      await upsertBusinessProfile(profileData);
      
      toast({
        title: "Success",
        description: "Policies have been updated",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update policies",
        variant: "destructive"
      });
      console.error('Failed to save policies:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSaveHours = async () => {
    setLoading(true)
    try {
      const existingProfile = await getBusinessProfile()

      await upsertBusinessProfile({
        'restaurant-name': existingProfile['restaurant-name'],  // Required field
        'operating-hours': schedule,
        phone: existingProfile.phone,
        website: existingProfile.website,
        address: existingProfile.address,
        'capacity_info': existingProfile['capacity_info']
      })
      toast({
        title: "Success",
        description: "Operating hours have been updated",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update operating hours",
        variant: "destructive"
      })
      console.error('Failed to save hours:', error)
    } finally {
      setLoading(false)
    }
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
            <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="logo">Branding Logo</Label>
              <div className="space-y-3 flex flex-col">
                {logoUrl && (
                  <div className="w-32 h-32 flex justify-center">
                    <Image 
                      src={logoUrl} 
                      alt="Business Logo" 
                      width={128} 
                      height={128} 
                      className="object-cover rounded-lg"
                      unoptimized={true}
                      priority={true}
                      onError={(e) => {
                        try {
                          const imgElement = e.currentTarget as HTMLImageElement;
                          console.error('Image loading error:', {
                            src: imgElement.src,
                            naturalWidth: imgElement.naturalWidth,
                            naturalHeight: imgElement.naturalHeight,
                            complete: imgElement.complete,
                            currentSrc: imgElement.currentSrc,
                            error: e,
                          });

                          // Network error check
                          if (!imgElement.complete) {
                            console.error('Network error: Image failed to load');
                            toast({
                              title: "Error",
                              description: "Failed to load image due to network error",
                              variant: "destructive"
                            });
                          }

                          // CORS error check
                          if (imgElement.naturalWidth === 0 && imgElement.naturalHeight === 0) {
                            console.error('CORS error: Image might be blocked due to cross-origin restrictions');
                            toast({
                              title: "Error",
                              description: "Image access blocked due to security restrictions",
                              variant: "destructive"
                            });
                          }

                          // HTTP error check
                          fetch(imgElement.src)
                            .then(response => {
                              if (!response.ok) {
                                console.error(`HTTP error: ${response.status} ${response.statusText}`);
                                toast({
                                  title: "Error",
                                  description: `Failed to load image: ${response.statusText}`,
                                  variant: "destructive"
                                });
                              }
                            })
                            .catch(fetchError => {
                              console.error('Fetch error:', fetchError);
                              toast({
                                title: "Error",
                                description: "Failed to verify image source",
                                variant: "destructive"
                              });
                            });
                        } catch (error: any) {
                          console.error('Error in onError handler:', {
                            name: error?.name,
                            message: error?.message,
                            stack: error?.stack,
                            fullError: JSON.stringify(error, null, 2)
                          });
                          toast({
                            title: "Error",
                            description: "An unexpected error occurred while loading the image",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  </div>
                )}
                <div className="flex w-full">
                  <Input
                    type="file"
                    id="logo-upload"
                    onChange={(e) => {
                      try {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          
                          // File size validation (e.g., 5MB limit)
                          if (file.size > 5 * 1024 * 1024) {
                            toast({
                              title: "Error",
                              description: "File size must be less than 5MB",
                              variant: "destructive"
                            });
                            return;
                          }

                          // File type validation
                          if (!file.type.startsWith('image/')) {
                            toast({
                              title: "Error",
                              description: "Please upload an image file",
                              variant: "destructive"
                            });
                            return;
                          }

                          handleLogoUpload(e);
                        }
                      } catch (error) {
                        console.error('Error handling file upload:', error);
                        toast({
                          title: "Error",
                          description: "Failed to process the uploaded file",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="hidden"
                    accept="image/*"
                  />
                  <UploadButton
                    type="button"
                    text={logoFile ? logoFile.name : "Upload"}
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    variant="secondary"
                  />
                </div>
              </div>
            </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input 
                  type="text" 
                  id="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  type="tel" 
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="website">Website</Label>
                <Input 
                  type="text" 
                  id="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className={websiteError ? "border-red-500" : ""}
                  placeholder="example.com or www.example.com"
                />
                {websiteError && (
                  <span className="text-sm text-red-500">{websiteError}</span>
                )}
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
              <Button 
                type="submit"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
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

        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePolicies} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea 
                  id="cancellationPolicy" 
                  value={formData.cancellationPolicy}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="refundPolicy">Refund Policy</Label>
                <Textarea 
                  id="refundPolicy" 
                  value={formData.refundPolicy}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="dataUsageDisclaimer">Data Usage Disclaimer</Label>
                <Textarea 
                  id="dataUsageDisclaimer" 
                  value={formData.dataUsageDisclaimer}
                  onChange={handleInputChange}
                />
              </div>
              <Button 
                type="submit"
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Policies"}
              </Button>
            </form>
          </CardContent>
        </Card>


        {/* Rest of the profile sections remain unchanged */}
      </div>
    </div>
  )
}

