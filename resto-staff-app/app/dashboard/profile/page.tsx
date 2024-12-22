import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  return (
    <>
      <DashboardHeader
        heading="Restaurant Profile"
        text="Manage your restaurant's information and branding"
      />
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
                <Label htmlFor="about">About Your Restaurant</Label>
                <Textarea id="about" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              {/* Add inputs for operating hours here */}
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="logo">Logo</Label>
                <Input type="file" id="logo" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="colors">Brand Colors</Label>
                <Input type="color" id="primaryColor" className="h-10 w-20" />
                <Input type="color" id="secondaryColor" className="h-10 w-20" />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

