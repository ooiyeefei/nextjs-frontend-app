"use client"

import { useEffect, useState } from "react"
import { getProductImageUrl, getProducts, updateProduct } from "@/lib/supabase/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import { CreateProductModal } from "@/components/dashboard/create-product-modal"
import { EditProductModal } from "@/components/dashboard/edit-product-modal"
import { DeleteProductModal } from "@/components/dashboard/delete-product-modal"
import { Product, SortConfig } from "@/types"
import Image from "next/image"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"

export default function ProductCataloguePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [productImages, setProductImages] = useState<{[key: string]: string}>({})
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: null,
        direction: 'asc'
      });

    // First effect for fetching products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true)
                const data = await getProducts()
                setProducts(data)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProducts()
    }, [refreshTrigger])

    // Second effect for loading images
    useEffect(() => {
        const loadProductImages = async () => {
            const imageUrls: {[key: string]: string} = {}
            for (const product of products) {
                if (product.image_url) {
                    const url = await getProductImageUrl(product.image_url)
                    if (url) imageUrls[product.id] = url
                }
            }
            setProductImages(imageUrls)
        }
        
        if (products.length > 0) {
            loadProductImages()
        }
    }, [products])

    const requestSort = (key: string) => {
        setSortConfig((prevConfig) => ({
          key,
          direction: prevConfig.key === key && prevConfig.direction === 'asc' 
            ? 'desc' 
            : 'asc',
        }));
      }

      const sortData = (data: Product[], sortConfig: SortConfig) => {
        if (!sortConfig.key) return data;
      
        return [...data].sort((a, b) => {
          if (sortConfig.key === 'price') {
            return sortConfig.direction === 'asc' 
              ? a.price - b.price 
              : b.price - a.price;
          }
      
          if (sortConfig.key === 'stock_quantity') {
            return sortConfig.direction === 'asc'
              ? a.stock_quantity - b.stock_quantity
              : b.stock_quantity - a.stock_quantity;
          }
      
          const aValue = a[sortConfig.key as keyof Product] ?? '';
          const bValue = b[sortConfig.key as keyof Product] ?? '';
      
          return sortConfig.direction === 'asc'
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        });
      }
      
    
    const refreshProducts = async () => {
        setRefreshTrigger(prev => prev + 1)
    }

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product)
        setEditModalOpen(true)
    }

    const handleStatusToggle = async (product: Product, newStatus: boolean) => {
      try {
          await updateProduct({
              id: product.id,
              is_active: newStatus
          })
          setProducts(products.map(p => 
              p.id === product.id 
                  ? {...p, is_active: newStatus} 
                  : p
          ))
          toast({
              title: "Success",
              description: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`,
              variant: "success"
          })
      } catch (error) {
          console.error('Error updating product status:', error)
          toast({
              title: "Error",
              description: "Failed to update product status",
              variant: "destructive"
          })
      }
  }

    const handleDeleteProduct = (product: Product) => {
        setSelectedProduct(product)
        setDeleteModalOpen(true)
    }

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Product Catalogue</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <Card>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Image</TableHead>
                            {[
                            { key: 'name', label: 'Name' },
                            { key: 'price', label: 'Price' },
                            { key: 'category', label: 'Category' },
                            { key: 'stock_quantity', label: 'Stock' },
                            { key: 'is_active', label: 'Status' }
                            ].map(column => (
                            <TableHead
                                key={column.key}
                                className="text-center cursor-pointer hover:bg-accent/50 py-6 px-3"
                                onClick={() => requestSort(column.key)}
                            >
                                <div className="flex items-center justify-center gap-3">
                                {column.label}
                                {sortConfig.key === column.key && (
                                    <span>{sortConfig.direction === 'asc' ? '🔼' : '🔽'}</span>
                                )}
                                </div>
                            </TableHead>
                            ))}
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortData(products, sortConfig).map((product) => (
                        <TableRow key={product.id}>
                            <TableCell className="text-center">
                                {productImages[product.id] && (
                                    <div className="flex justify-center items-center">
                                        <Image 
                                            src={productImages[product.id]}
                                            alt={product.name}
                                            width={36}
                                            height={36}
                                            className="rounded-md object-cover"
                                        />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-center font-medium">{product.name}</TableCell>
                            <TableCell className="text-center">${product.price.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{product.category || '-'}</TableCell>
                            <TableCell className="text-center">{product.stock_quantity}</TableCell>
                            <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-3">
                            <Switch
                                checked={product.is_active}
                                onCheckedChange={(checked) => handleStatusToggle(product, checked)}
                                className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-500"
                            />
                                <span className={`px-3 py-1 rounded text-white ${
                                    product.is_active 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-500'
                                }`}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </TableCell>
                            <TableCell className="text-center">
                            <div className="flex justify-center gap-3">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleEditProduct(product)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteProduct(product)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CreateProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refreshProducts}
            />
            <EditProductModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                product={selectedProduct}
                onSuccess={refreshProducts}
            />
            <DeleteProductModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                product={selectedProduct}
                onSuccess={refreshProducts}
            />
        </div>
    )
}
