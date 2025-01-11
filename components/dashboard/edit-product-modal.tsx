// components/dashboard/edit-product-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useEffect, useState } from "react"
import { getProductCategories, moveProductImage, updateProduct, uploadProductImage } from "@/lib/supabase/queries"
import { Product } from "@/types"
import { UploadButton } from "../ui/upload-button"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { X } from "lucide-react"

type OptionType = {
    value: string;
    label: string;
  };
  
interface EditProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null
    onSuccess?: () => Promise<void>
}

export function EditProductModal({ isOpen, onClose, product, onSuccess }: EditProductModalProps) {
    const [categories, setCategories] = useState<string[]>([])
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        price: string;
        category: string;
        stock_quantity: string;
        discount: string;
        tags: string;
        is_active: boolean;
      }>({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '0',
        discount: '0',
        tags: '',
        is_active: true
      })
    const [isLoading, setIsLoading] = useState(false)
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
    const [newCategory, setNewCategory] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    

    useEffect(() => {
        async function initializeProductData() {
          if (product && isOpen) {
            const initialFormData = {
              name: product.name,
              description: product.description || '',
              price: product.price.toString(),
              category: product.category || '',
              stock_quantity: product.stock_quantity.toString(),
              discount: (product.discount || 0).toString(),
              tags: product.tags?.join(', ') || '',
              is_active: product.is_active
            }
            
            console.log('Setting form data:', initialFormData)
            setFormData(initialFormData)
            const categoryList = await getProductCategories(product.category)
            
            console.log('Fetched categories:', categoryList)
            setCategories(categoryList)
          }
        }
        initializeProductData()
      }, [product, isOpen])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!product) return
        
        setIsLoading(true)
        try {
            const supabase = createBrowserSupabaseClient()
            // Get business profile first
            const { data: businessProfile } = await supabase
            .from('business_profiles')
            .select('id')
            .single()
            
            if (!businessProfile) throw new Error('No business profile found')
        
            let finalImageUrl: string | undefined = product.image_url || undefined

            // If category changed and there's an existing image
            if (formData.category !== product.category && product.image_url) {
                finalImageUrl = await moveProductImage(
                product.image_url,
                formData.category,
                businessProfile.id
                )
            }
        
            // If there's a new image upload
            if (imageFile) {
                finalImageUrl = await uploadProductImage(imageFile, formData.category)
            }

            await updateProduct({
                id: product.id,
                name: formData.name,
                image_url: finalImageUrl,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category || null,
                stock_quantity: parseInt(formData.stock_quantity),
                discount: parseFloat(formData.discount),
                tags: formData.tags.split(',').map(tag => tag.trim()),
                is_active: formData.is_active
            })
            
            toast({
                title: "Success",
                description: "Product updated successfully",
                variant: "success"
            })
            
            if (onSuccess) {
                await onSuccess()
            }
            onClose()
        } catch (error) {
            console.error('Failed to update product:', error)
            toast({
                title: "Error",
                description: "Failed to update product",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.id]: e.target.value
        }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <div className="pr-6">
                <button 
                    onClick={onClose} 
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none bg-background"
                    >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
                </button>
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input 
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Image</Label>
                            <div className="col-span-3">
                                <UploadButton
                                type="button"
                                text={imageFile ? imageFile.name : "Upload"}
                                onClick={() => document.getElementById('image-upload')?.click()}
                                />
                                <Input 
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                className="hidden"
                                />
                            </div>
                            </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea 
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input 
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-select" className="text-right">Category</Label>
                                {showNewCategoryInput ? (
                                    <div className="col-span-3 flex gap-2">
                                    <Input 
                                        id="new-category"
                                        value={newCategory} 
                                        onChange={(e) => setNewCategory(e.target.value)} 
                                        placeholder="Enter new category" 
                                        className="flex-1" 
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            if (newCategory) {
                                                setFormData(prev => ({...prev, category: newCategory}))
                                                setCategories(prev => [...prev, newCategory])
                                            }
                                            setShowNewCategoryInput(false)
                                            setNewCategory('')
                                        }}
                                    >
                                        Add
                                    </Button>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            setShowNewCategoryInput(false)
                                            setNewCategory('')
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            ) : (
                                <Select 
                                    value={formData.category || ""}
                                    onValueChange={(value) => {
                                        if (value === 'new') {
                                        setShowNewCategoryInput(true)
                                        } else {
                                        setFormData(prev => ({ ...prev, category: value }))
                                        }
                                    }}
                                    >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder={formData.category || "Select category"}>
                                        {formData.category}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                        <SelectItem key={`category-${category}`} value={category}>
                                            {category}
                                        </SelectItem>
                                        ))}
                                        <SelectItem value="new">+ Add New Category</SelectItem>
                                    </SelectContent>
                                    </Select>
                            )}
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock_quantity" className="text-right">Stock</Label>
                            <Input 
                                id="stock_quantity"
                                type="number"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="discount" className="text-right">Discount %</Label>
                            <Input 
                                id="discount"
                                type="number"
                                step="0.01"
                                value={formData.discount}
                                onChange={handleChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4 mb-3">
                            <Label htmlFor="tags" className="text-right">Tags</Label>
                            <Input 
                                id="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="tag1, tag2, tag3"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4 mb-3">
                            <Label className="text-right">Status</Label>
                            <div className="col-span-3 flex items-center gap-3">
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => 
                                        setFormData(prev => ({...prev, is_active: checked}))
                                    }
                                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-500"
                                />
                                <Label htmlFor="is_active" className={`px-2 py-1 rounded text-white ${
                                    formData.is_active ? 'bg-green-500' : 'bg-gray-500'
                                }`}>
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                </Label>
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="button" variant="destructive" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Product"}
                        </Button>
                    </DialogFooter>
                </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
