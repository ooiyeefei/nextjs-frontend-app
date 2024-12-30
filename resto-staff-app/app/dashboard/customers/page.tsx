"use client"

import { useEffect, useState } from "react"
import { getCustomers } from "@/lib/supabase/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronRight, PlusCircle } from 'lucide-react'
import { useRouter } from "next/navigation"
import { CreateCustomerModal } from "@/components/dashboard/create-customer-modal"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_visits: number
  joined_date: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const data = await getCustomers()
        setCustomers(data)
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  const handleRowClick = (customerId: string) => {
    router.push(`/dashboard/customers/${customerId}`)
  }

  const refreshCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error refreshing customers:', error)
    }
  }
  

  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customers</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Customer
          </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Visits</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow
                  key={customer.id}
                  className={`
                    cursor-pointer 
                    transition-colors 
                    hover:bg-accent/60
                    group
                    ${index % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/40'}
                  `}
                  onClick={() => handleRowClick(customer.id)}
                >
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.total_visits}</TableCell>
                  <TableCell>
                      <ChevronRight 
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CreateCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshCustomers}
      />
    </div>
    </>
  )
}
