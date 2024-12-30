"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TableType } from "./table-capacity-settings"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from 'lucide-react'

interface TableAvailability {
  tableTypeId: string;
  tableTypeName: string;
  quantity: number;
}

interface TableAvailabilityProps {
  tableTypes: TableType[]
  availabilities: TableAvailability[]
  onAvailabilityChange: (availabilities: TableAvailability[]) => void
}

export function TableAvailability({
  tableTypes,
  availabilities,
  onAvailabilityChange,
}: TableAvailabilityProps) {
  const addTableAvailability = () => {
    if (tableTypes.length > 0) {
      const newAvailability: TableAvailability = {
        tableTypeId: tableTypes[0].id,
        quantity: 1,
        tableTypeName: ""
      }
      onAvailabilityChange([...availabilities, newAvailability])
    }
  }

  const removeTableAvailability = (index: number) => {
    onAvailabilityChange(availabilities.filter((_, i) => i !== index))
  }

  const updateTableAvailability = (index: number, field: keyof TableAvailability, value: any) => {
    onAvailabilityChange(
      availabilities.map((avail, i) =>
        i === index ? { ...avail, [field]: value } : avail
      )
    )
  }

  return (
    <div className="space-y-2 pl-4 border-l-2 border-muted">
      <div className="text-sm font-medium mb-2">Available Tables</div>
      {availabilities.map((availability, index) => (
        <div key={index} className="flex items-end gap-4">
          <div className="flex-1">
            <Label className="text-sm">Table Type</Label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
              value={availability.tableTypeId}
              onChange={(e) => updateTableAvailability(index, 'tableTypeId', e.target.value)}
            >
              {tableTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.seats} seats)
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <Label className="text-sm">Quantity</Label>
            <Input
              type="number"
              min="1"
              value={availability.quantity}
              onChange={(e) => updateTableAvailability(index, 'quantity', parseInt(e.target.value))}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeTableAvailability(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addTableAvailability}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Table
      </Button>
    </div>
  )
}

