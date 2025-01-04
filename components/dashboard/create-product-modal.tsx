"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useState, useEffect } from "react"
import { X } from 'lucide-react'
import { createProduct, getProductCategories, uploadProductImage } from "@/lib/supabase/queries"
import { UploadButton } from "../ui/upload-button"

interface CreateProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => Promise<void>;
}

export function CreateProductModal({ isOpen, onClose, onSuccess}: CreateProductModalProps) {
    const [categories, setCategories] = useState<string[]>([])
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
    const [newCategory, setNewCategory] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '0',
        discount: '0',
        tags: '',
        is_active: true
    })
    const [imageFile, setImageFile] = useState<File | null>(null)

    useEffect(() => {
        async function fetchCategories() {
            if (isOpen) {
                const categoryList = await getProductCategories()
                setCategories(categoryList)
            }
        }
        fetchCategories()
    }, [isOpen])

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        try {
            let imageUrl: string | undefined = undefined
            if (imageFile) {
            imageUrl = await uploadProductImage(imageFile, formData.category)
            }

            await createProduct({
                name: formData.name,
                image_url: imageUrl,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                stock_quantity: parseInt(formData.stock_quantity),
                discount: parseFloat(formData.discount),
                tags: formData.tags.split(',').map(tag => tag.trim()),
                is_active: formData.is_active
            })

            if (onSuccess) {
                await onSuccess()
            }

            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                stock_quantity: '0',
                discount: '0',
                tags: '',
                is_active: true
            })

            toast({
                title: "Success",
                description: "Product created successfully",
                variant: "success"
            })

            onClose()
        } catch (error) {
            console.error('Error creating product:', error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create product",
                variant: "destructive"
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                <DialogHeader>
                    <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="col-span-3" required />
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
                            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="col-span-3" required />
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
                                    value={formData.category}
                                    onValueChange={(value) => {
                                        if (value === 'new') {
                                            setShowNewCategoryInput(true)
                                        } else {
                                            setFormData(prev => ({ ...prev, category: value }))
                                        }
                                    }}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select category" />
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
                            <Input id="stock_quantity" type="number" value={formData.stock_quantity} onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="discount" className="text-right">Discount %</Label>
                            <Input id="discount" type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tags" className="text-right">Tags</Label>
                            <Input id="tags" placeholder="tag1, tag2, tag3" value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Product</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
