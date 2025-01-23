// Base Types and Enums
export type Status = 'arriving-soon' | 'late' | 'no-show' | 'confirmed' | 'seated' | 'completed' | 'new' | 'cancelled';

export const statusColors = {
  new: 'bg-status-blue',
  'arriving-soon': 'bg-status-yellow',
  late: 'bg-status-red',
  cancelled: 'bg-status-gray',
  'no-show': 'bg-status-gray',
  confirmed: 'bg-status-blue',
  seated: 'bg-status-green',
  completed: 'bg-status-green',
};

// Data Models
export interface User {
  id: string
  email: string
  name: string[]
  phone: string[]
  joined_date: string
  is_business_user: boolean
  business_id?: string | null
  total_visits?: number
  is_registered: boolean
}

export interface Reservation {
  id: string
  confirmation_code?: string
  date: string
  timeslot_start: string
  timeslot_end: string
  party_size: number
  status: Status
  created_at?: string
  updated_at?: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  deposit_amount?: number
  is_deposit_made?: boolean
  dietary_restrictions?: string
  business_id: string
  special_occasions?: string
  special_requests?: string
}

export interface BusinessProfile {
  id?: string
  slug: string
  name: string
  cuisine?: string
  address: string
  google_place_id?: string
  google_latitude?: number
  google_longitude?: number
  google_maps_url?: string
  images?: string[]
  cancellation_policy?: string
  refund_policy?: string
  general_policy?: string
  data_usage_policy?: string
  min_allowed_booking_advance_hours: number
  max_allowed_booking_advance_hours: number
  allowed_cancellation_hours: number
  created_at?: string
  updated_at?: string
  is_active: boolean
  is_deposit_required: boolean
  operating_hours: Record<string, any>
  description?: string
  timezone: string
  owner_user_id: string
  phone?: string | null
  website?: string | null
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
  day_of_week: number
  timeslot_length_minutes: number
  reservation_start_time: string
  reservation_end_time: string
  capacity_settings: { default: number }
  is_default: boolean
}

export interface BookingSettings {
  min_allowed_booking_advance_hours: number;
  max_allowed_booking_advance_hours: number;
  allowed_cancellation_hours: number;
  settings: ReservationSetting[];
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
    reservation: Reservation
    onSuccess?: () => Promise<void>
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
    reservation_start_time: string;
    reservation_end_time: string;
    tables: Array<{
      tableTypeId: string;
      quantity: number;
    }>;
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
    customer_name: string
    customer_email: string
    customer_phone: string
    date: string
    timeslot_start: string
    timeslot_end: string
    party_size: number
    status: Status
    special_requests?: string | null
    dietary_restrictions?: string | null
  }
  
  
export interface TableType {
    id: string
    name: string
    seats: number
  }
  
export type SortConfig = {
    key: string | null;  // Allow both string and null
    direction: 'asc' | 'desc';  // Restrict direction to literal types
  }