"use client"

import { useEffect, useState } from "react"
import { getCustomerById, getCustomers } from "@/lib/supabase/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronRight, PlusCircle } from 'lucide-react'
import { useRouter } from "next/navigation"
import { CreateCustomerModal } from "@/components/dashboard/create-customer-modal"
import { EditCustomerModal } from "@/components/dashboard/edit-customer-modal"
import { DeleteCustomerModal } from "@/components/dashboard/delete-customer-modal"
import { User } from "@/types"

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {

    console.log('📄 Page Auth Check:', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });

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
  }, [refreshTrigger])

  const handleRowClick = async (customerId: string) => {
    console.log('🚀 Navigation Start:', {
      customerId,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    })

    try {
      router.push(`/dashboard/customers/${customerId}`)
    } catch (error) {
      console.error('Navigation error:', {
        error,
        customerId,
        timestamp: new Date().toISOString()
      })
    }
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

  const handleEditCustomer = (customer: User) => {
    setSelectedCustomer(customer)
    setEditModalOpen(true)
  }

  const handleDeleteCustomer = (customer: User) => {
    setSelectedCustomer(customer)
    setDeleteModalOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Customers List</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Customer
          </Button>
        </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Email</TableHead>
                <TableHead className="text-center">Phone</TableHead>
                <TableHead className="text-center">Total Visits</TableHead>
                <TableHead className="text-center w-[200px]">Actions</TableHead>
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
                  <TableCell className="text-center font-medium">{customer.name}</TableCell>
                  <TableCell className="text-center">{customer.email}</TableCell>
                  <TableCell className="text-center">{customer.phone}</TableCell>
                  <TableCell className="text-center">{customer.total_visits}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-3">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditCustomer(customer)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCustomer(customer)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
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
      <EditCustomerModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={refreshCustomers}
      />
      <DeleteCustomerModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={refreshCustomers}
      />
    </div>
    </>
  )
}
