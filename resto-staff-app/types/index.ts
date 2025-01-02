// Base Types and Enums
export type Status = 'arriving-soon' | 'late' | 'no-show' | 'confirmed' | 'seated' | 'completed'

// UI Constants
export const statusColors: Record<Status, string> = {
    'arriving-soon': '!bg-yellow-500 !text-white',
    'late': '!bg-red-500 !text-white',
    'no-show': '!bg-gray-500 !text-white',
    'confirmed': '!bg-blue-500 !text-white',
    'seated': '!bg-green-500 !text-white',
    'completed': '!bg-green-500 !text-white',
  }

// Data Models
export interface Customer {
    id: string
    name: string
    email: string
    phone: string
    total_visits: number
    joined_date: string
    business_id?: string
  reservation_id?: string | null  
}
export interface Reservation {
    reservation_id: string
    reservation_time: string
    customer_email: string
    phone: string
    status: Status
    special_requests: string | null
    dietary_restrictions: string | null
    party_size: number
    customers: {
      name: string
      email: string
    } | null
}

export interface BusinessProfile {
    id?: string;
    'restaurant-name': string;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    'operating-hours'?: Record<string, any> | null;
    'capacity_info'?: Record<string, any> | null;
    user_id: string;
    cancellation_policy?: string | null;
    refund_policy?: string | null;
    data_usage_disclaimer?: string | null;
  }

// Component Props
export interface ModalProps {
    isOpen: boolean
    onClose: () => void
  }

export interface ReservationsTabProps {
    onCancelReservation: (reservation: Reservation) => void;
    onEditReservation: (reservation: Reservation) => void;
  }

export interface EditReservationModalProps {
    isOpen: boolean
    onClose: () => void
    reservation: Reservation | null
}

export interface CancelReservationModalProps {
    isOpen: boolean
    onClose: () => void
    reservation: Reservation | null
  }

  // API/Data Types
export interface TableAvailability {
    tableTypeName: any
    tableTypeId: string
    quantity: number
  }
  
  export interface TimeSlot {
    start: string
    end: string
    tables: TableAvailability[]
  }
  
  export interface DaySchedule {
    enabled: boolean
    timeSlots: TimeSlot[]
  }
  
  export interface DateSchedule {
    date: Date
    timeSlots: TimeSlot[]
  }
  
  export type WeeklyScheduleState = {
    [key in 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT']: DaySchedule
  }
  
  export interface CreateReservationData {
    customer_email: string
    customer_name: string | null
    phone?: string | null
    reservation_time: string
    status: string
    special_requests?: string | null
    dietary_restrictions?: string | null
    party_size: number
  }
  
export interface TableType {
    id: string
    name: string
    seats: number
  }
  
