"use client"

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { PlusCircle, X } from 'lucide-react'
import Image from 'next/image'
import { toast } from '@/components/ui/toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// Sample menu items data structure
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image?: string | File
  imageUrl?: string 
  isActive: boolean
}

export default function ProductCataloguePage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: '1',
      name: 'Spaghetti Carbonara',
      description: 'Classic spaghetti with creamy carbonara sauce',
      price: 12.99,
      image: '/placeholder.svg?height=128&width=128',
      isActive: true,
    },
  ])
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    menuItems.forEach(menuItem => {
      if (menuItem.image instanceof File) {
        const objectUrl = URL.createObjectURL(menuItem.image)
        setImageUrls(prev => ({
          ...prev,
          [menuItem.id]: objectUrl
        }))
      }
    })
  
    // Cleanup function
    return () => {
      Object.values(imageUrls).forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [menuItems])
  
  const handleAddMenuItem = () => {
    setEditingMenuItem(null)
    setIsModalOpen(true)
  }

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingMenuItem(menuItem)
    setIsModalOpen(true)
  }

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
    toast({
      title: 'Menu item deleted',
      variant: 'destructive',
    })
  }

  const handleToggleActive = (id: string) => {
    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    )
  }

  const handleCloseModal = () => {
    setEditingMenuItem(null)
    setIsModalOpen(false)
  }

  const handleSubmitModal = (newMenuItem: MenuItem) => {
    if (editingMenuItem) {
      // Update existing menu item
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingMenuItem.id ? newMenuItem : item
        )
      )
      toast({
        title: 'Menu item updated',
        variant: 'success',
      })
    } else {
      // Add new menu item
      setMenuItems((prev) => [...prev, newMenuItem])
      toast({
        title: 'Menu item added',
        variant: 'success',
      })
    }
    handleCloseModal()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Catalogue</h1>
        <Button onClick={handleAddMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {(item.imageUrl || item.image) && (
                        <Image
                        alt={item.name}
                        src={item.imageUrl || (typeof item.image === 'string' ? item.image : '')}
                        width={64}
                        height={64}
                        />
                    )}
                    </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>${item.price}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={item.isActive}
                      onCheckedChange={() => handleToggleActive(item.id)}
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMenuItem(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMenuItem(item.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
        menuItem={editingMenuItem}
      />
    </div>
  )
}

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (newMenuItem: MenuItem) => void
  menuItem?: MenuItem | null
}

function MenuItemModal({
  isOpen,
  onClose,
  onSubmit,
  menuItem,
}: MenuItemModalProps) {
  const [formData, setFormData] = useState<MenuItem>(
    menuItem || {
      id: new Date().toISOString(), // Generate a unique ID
      name: '',
      description: '',
      price: 0,
      image: undefined,
      isActive: true,
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submissionData = { ...formData }
    
    if (formData.image instanceof File) {
      // Create object URL for preview or handle file upload
      const imageUrl = URL.createObjectURL(formData.image)
      submissionData.image = imageUrl
    }
    
    onSubmit(submissionData)
  }

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const parsedValue = name === 'price' ? parseFloat(value) : value
    setFormData((prev) => ({ ...prev, [name]: parsedValue }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0]
        setFormData((prev) => ({
          ...prev,
          image: file
        }))
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {menuItem ? 'Edit Menu Item' : 'Add Menu Item'}
          </DialogTitle>
          <DialogDescription>
            {menuItem
              ? 'Make changes to the menu item details.'
              : 'Add a new item to the menu.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <Input
                type="file"
                id="image"
                onChange={handleImageChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              {menuItem ? 'Update Menu Item' : 'Add Menu Item'}
            </Button>
          </DialogFooter>
        </form>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  )
}

