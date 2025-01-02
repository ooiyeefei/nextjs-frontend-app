"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TableType } from "./table-capacity-settings"
import { Plus, X } from 'lucide-react'
import { useEffect } from "react"

interface TableAvailability {
  tableTypeId: string;
  tableTypeName: string;
  quantity: number;
}

interface TableAvailabilityProps {
  tableTypes: TableType[]
  availabilities: TableAvailability[]
  onAvailabilityChange: (availabilities: TableAvailability[]) => void
  timeSlotChunk: number
}

export function TableAvailability({
  tableTypes,
  availabilities,
  onAvailabilityChange,
  timeSlotChunk
}: TableAvailabilityProps) {
  useEffect(() => {
    console.log('TableAvailability props:', {
      tableTypesLength: tableTypes?.length,
      availabilitiesLength: availabilities?.length,
      hasOnAvailabilityChange: !!onAvailabilityChange
    });
  }, [tableTypes, availabilities, onAvailabilityChange]);
  
  const addTableAvailability = () => {
    console.log('Add Table clicked');
    console.log('Current tableTypes:', tableTypes);
    console.log('Current availabilities:', availabilities);
    if (!tableTypes || tableTypes.length === 0) {
      console.warn('No table types available');
      return;
    }
    const newAvailability = {
      tableTypeId: tableTypes[0].id,
      quantity: 1,
      tableTypeName: tableTypes[0].name
    };
    onAvailabilityChange([...availabilities, newAvailability]);
  };
  

  const removeTableAvailability = (index: number) => {
    onAvailabilityChange(availabilities.filter((_, i) => i !== index))
  }

  const updateTableAvailability = (index: number, field: keyof TableAvailability, value: any) => {
    const newAvailabilities = [...availabilities];
    newAvailabilities[index] = {
      ...newAvailabilities[index],
      [field]: value
    };
    onAvailabilityChange(newAvailabilities);
  };  

  return (
    <div className="space-y-2 pl-4 border-l-2 border-muted">
      <div className="text-sm font-medium mb-2">Available Tables</div>
      {availabilities.map((availability, index) => (
        <div key={index} className="flex items-end gap-4">
          <div className="flex-1">
            <Label className="text-sm">Table Type</Label>
            <select
              id={`table-type-${index}`}
              name={`table-type-${index}`}
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
              id={`quantity-${index}`}
              name={`quantity-${index}`}
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

