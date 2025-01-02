"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useState } from "react"
import { deleteCustomer } from "@/lib/supabase/queries"
import { Customer } from "@/types"

interface DeleteCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onSuccess?: () => Promise<void>
}

export function DeleteCustomerModal({ isOpen, onClose, customer, onSuccess }: DeleteCustomerModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (!customer) return
    
    setIsLoading(true)
    try {
      await deleteCustomer(customer.id)
      
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success"
      })
      
      if (onSuccess) {
        await onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete this customer?
          </p>
          {customer && (
            <div className="mt-4 space-y-2">
              <p><strong>Name:</strong> {customer.name}</p>
              <p><strong>Email:</strong> {customer.email}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
