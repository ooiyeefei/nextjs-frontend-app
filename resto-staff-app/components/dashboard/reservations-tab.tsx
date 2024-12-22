import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../ui/table"
  
  const reservations = [
    {
      id: "1",
      customerName: "John Doe",
      date: "2023-06-01",
      time: "19:00",
      partySize: 4,
      status: "Confirmed",
    },
    {
      id: "2",
      customerName: "Jane Smith",
      date: "2023-06-02",
      time: "20:30",
      partySize: 2,
      status: "Pending",
    },
    {
      id: "3",
      customerName: "Bob Johnson",
      date: "2023-06-03",
      time: "18:00",
      partySize: 6,
      status: "Confirmed",
    },
  ]
  
  export function ReservationsTab() {
    return (
      <Table>
        <TableCaption>A list of upcoming reservations.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Party Size</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.customerName}</TableCell>
              <TableCell>{reservation.date}</TableCell>
              <TableCell>{reservation.time}</TableCell>
              <TableCell>{reservation.partySize}</TableCell>
              <TableCell>{reservation.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
  
  