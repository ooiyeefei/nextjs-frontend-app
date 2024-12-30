"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { useState } from "react"
import { X } from 'lucide-react'
import { createCustomer } from "@/lib/supabase/queries"


interface CreateCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => Promise<void>;
  }

export function CreateCustomerModal({ isOpen, onClose, onSuccess}: CreateCustomerModalProps) {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: ''
    })
  
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        try {
          await createCustomer({
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          })
          
          if (onSuccess) {
            await onSuccess()
          }

          setFormData({
            name: '',
            email: '',
            phone: ''
          })

          toast({
            title: "Success",
            description: "Customer created successfully",
            variant: "success"
            })

          onClose()
        } catch (error) {
          console.error('Error creating customer:', error)
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to create customer",
            variant: "destructive"
            })
        }
      }
      
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value
      })
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3" 
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  className="col-span-3" 
                  required 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                  className="col-span-3" 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Customer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
  
