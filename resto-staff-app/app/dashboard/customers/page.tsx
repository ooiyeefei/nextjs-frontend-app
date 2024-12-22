"use client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"

const customers = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", visits: 5 },
  { id: 2, name: "Bob Smith", email: "bob@example.com", visits: 3 },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", visits: 7 },
]

export default function CustomersPage() {
    const router = useRouter()

    const handleRowClick = (customerId: number) => {
        router.push(`/dashboard/customers/${customerId}`)
      }

    return (
      <>
        <DashboardHeader
          heading="Customers"
          text="Manage your restaurant's customer base"
        />
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Visits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleRowClick(customer.id)}
                  >
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.visits}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </>
    )
  }