import { ReservationsTab } from "@/components/dashboard/reservations-tab"

export default function ReservationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold mb-8">Reservations</h1>
      <ReservationsTab />
    </div>
  )
}

