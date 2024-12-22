import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"

export default function BookingOptionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-8">Booking Options</h1>
      <Card>
        <CardHeader>
          <CardTitle>Booking Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="maxPartySize">Maximum Party Size</Label>
              <Input type="number" id="maxPartySize" defaultValue={10} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="minAdvanceHours">Minimum Advance Booking (hours)</Label>
              <Input type="number" id="minAdvanceHours" defaultValue={2} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="maxAdvanceDays">Maximum Advance Booking (days)</Label>
              <Input type="number" id="maxAdvanceDays" defaultValue={30} />
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
    </div>
  )
}

