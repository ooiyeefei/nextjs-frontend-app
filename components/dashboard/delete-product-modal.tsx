// components/dashboard/delete-product-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useState } from "react"
import { deleteProduct } from "@/lib/supabase/queries"
import { Product } from "@/types"

interface DeleteProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onSuccess?: () => Promise<void>
}

export function DeleteProductModal({ isOpen, onClose, product, onSuccess }: DeleteProductModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        if (!product) return
        
        setIsLoading(true)
        try {
            await deleteProduct(product.id)
            
            toast({
                title: "Success",
                description: "Product deleted successfully",
                variant: "success"
            })
            
            if (onSuccess) {
                await onSuccess()
            }
            onClose()
        } catch (error) {
            console.error('Failed to delete product:', error)
            toast({
                title: "Error",
                description: "Failed to delete product",
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
                    <DialogTitle>Delete Product</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                    <p className="text-muted-foreground">
                        Are you sure you want to delete this product?
                    </p>
                    {product && (
                        <div className="mt-4 space-y-2">
                            <p><strong>Name:</strong> {product.name}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>Category:</strong> {product.category}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? "Deleting..." : "Delete Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
