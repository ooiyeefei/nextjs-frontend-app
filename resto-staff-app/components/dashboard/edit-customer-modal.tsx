"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { useEffect, useState } from "react"
import { updateCustomer } from "@/lib/supabase/queries"
import { Customer } from "@/types"
  
interface EditCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess?: () => Promise<void>
}

export function EditCustomerModal({ isOpen, onClose, customer, onSuccess }: EditCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || ''
  })

  const [existingData, setExistingData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (customer && isOpen) {
      // Store both current form data and existing data
      const currentData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
      setFormData(currentData)
      setExistingData(currentData)
    }
  }, [customer, isOpen])

  const handleClose = () => {
    setFormData({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || ''
    })
    onClose()
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!customer) return

    console.log('Original customer email:', customer.email)
    console.log('New email value:', formData.email)
    
    setIsLoading(true)

    console.log('Current customer data:', customer)
    console.log('Existing data:', existingData)
    console.log('Form data:', formData)

    try {
      const result = await updateCustomer(customer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        existing_email: customer.email
      })
      
      if (!result) {
        throw new Error('Failed to update customer')
      }
      
      toast({
        title: "Success",
        description: "Customer updated successfully",
        variant: "success"
      })
      
      onClose()
      
      if (onSuccess) {
        await onSuccess()
      }
      
    } catch (error: any) {
      console.error('Failed to update customer:', error?.message)
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
