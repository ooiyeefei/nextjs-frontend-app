// Base Types and Enums
export type Status = 'arriving-soon' | 'late' | 'no-show' | 'confirmed' | 'seated' | 'completed';

export const statusColors = {
  'arriving-soon': 'bg-status-yellow',
  late: 'bg-status-red',
  'no-show': 'bg-status-gray',
  confirmed: 'bg-status-blue',
  seated: 'bg-status-green',
  completed: 'bg-status-green',
};

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
    customer_name: string | undefined;
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
    'restaurant_name': string;
    phone?: string | null;
    address?: string | null;
    website?: string | null;
    'operating_hours'?: Record<string, any> | null;
    'capacity_info'?: Record<string, any> | null;
    user_id: string;
    cancellation_policy?: string | null;
    refund_policy?: string | null;
    data_usage_disclaimer?: string | null;
  }

export interface Product {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category: string | null
  stock_quantity: number
  discount: number | null
  rating: number | null
  tags: string[]
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  image_url?: string
  is_active: boolean
  category?: string | null
  stock_quantity?: number
  discount?: number
  tags?: string[]
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
  category?: string | null
}

export interface AvailableTable {
  tableTypeId: string
  tableTypeName: string
  quantity: number
}

export interface CapacitySettings {
  available_tables: AvailableTable[]
}

export interface ReservationSetting {
  business_id: string
  day_of_week: number
  start_time: string
  end_time: string
  specific_date: string | null
  capacity_settings: CapacitySettings
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
export interface CreateReservationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => Promise<void>
    onReservationCreated?: () => Promise<void>;
  }

export interface EditReservationModalProps {
    isOpen: boolean
    onClose: () => void
    reservation: Reservation | null
    onReservationUpdated?: () => Promise<void>;
}

export interface CancelReservationModalProps {
    isOpen: boolean
    onClose: () => void
    reservation: Reservation | null
    onReservationCancelled?: () => Promise<void>;
  }

export interface TableAvailabilityProps {
  tableTypes: TableType[]
  availabilities: TableAvailability[]
  onAvailabilityChange: (availabilities: TableAvailability[]) => void
  timeSlotChunk: number
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
  
