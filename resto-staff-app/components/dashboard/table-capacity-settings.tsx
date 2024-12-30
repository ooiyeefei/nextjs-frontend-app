"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from 'lucide-react'
import { toast } from "../ui/toast"
import { updateTableTypes } from "@/lib/supabase/queries"

export interface TableType {
  id: string
  name: string
  seats: number
}

export function TableCapacitySettings() {
  const [tableTypes, setTableTypes] = useState<TableType[]>([
    { id: '1', name: 'Window Table', seats: 2 },
    { id: '2', name: 'Regular Table', seats: 4 },
    { id: '3', name: 'Family Table', seats: 6 },
  ])

  const addTableType = () => {
    const id = (Math.max(...tableTypes.map(t => parseInt(t.id))) + 1).toString()
    setTableTypes([...tableTypes, { id, name: '', seats: 2 }])
  }

  const removeTableType = (id: string) => {
    setTableTypes(tableTypes.filter(table => table.id !== id))
  }

  const updateTableType = (id: string, field: keyof TableType, value: string | number) => {
    setTableTypes(tableTypes.map(table =>
      table.id === id ? { ...table, [field]: value } : table
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table Types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tableTypes.map((table) => (
            <div key={table.id} className="grid gap-4 grid-cols-3 items-end">
              <div>
                <Label htmlFor={`name-${table.id}`}>Table Name</Label>
                <Input
                  id={`name-${table.id}`}
                  value={table.name}
                  onChange={(e) => updateTableType(table.id, 'name', e.target.value)}
                  placeholder="e.g., Window Table"
                />
              </div>
              <div>
                <Label htmlFor={`seats-${table.id}`}>Number of Seats</Label>
                <Input
                  id={`seats-${table.id}`}
                  type="number"
                  min="1"
                  value={table.seats}
                  onChange={(e) => updateTableType(table.id, 'seats', parseInt(e.target.value))}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeTableType(table.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={addTableType}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Table Type
          </Button>
          <Button 
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            onClick={async () => {
              try {
                await updateTableTypes(tableTypes)
                toast({
                  title: "Success",
                  description: "Table types have been updated",
                  variant: "success"
                })
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to update table types",
                  variant: "destructive"
                })
                console.error(error)
              }
            }}
          >
            Save Table Types
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

