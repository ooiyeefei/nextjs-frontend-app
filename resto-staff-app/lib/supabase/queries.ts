import { TableType } from '@/components/dashboard/table-capacity-settings';
import { WeeklySchedule } from '@/components/dashboard/weekly-schedule';
import { createBrowserSupabaseClient } from './client'
import { format } from 'date-fns';

type Customer = {
  name: string;
  email: string;
}

interface TableAvailability {
  tableTypeName: any;
  tableTypeId: string;
  quantity: number;
}

interface TimeSlot {
  start: string;
  end: string;
  tables: TableAvailability[];
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[];
}

interface DateSchedule {
  date: Date;
  timeSlots: TimeSlot[];
}

type WeeklyScheduleState = {
  [key in 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT']: DaySchedule;
};


interface BusinessProfile {
  id?: string;
  'restaurant-name': string;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  'operating-hours'?: Record<string, any> | null;
  'capacity_info'?: Record<string, any> | null;
  user_id: string;
}


type Reservation = {
  reservation_id: string;
  customer_email: string;
  customer_name: string;
  phone: string;
  reservation_time: string;
  status: string;
  special_requests: string | null;
  dietary_restrictions: string | null;
  party_size: number;
  customers?: Customer;
}

type CreateReservationData = {
  customer_email: string;
  customer_name: string | null;
  phone?: string | null;
  reservation_time: string;
  status: string;
  special_requests?: string | null;
  dietary_restrictions?: string | null;
  party_size: number;
}

export async function getReservations() {
  const supabase = createBrowserSupabaseClient()
  
  try {
    // First get the business profile for the authenticated user
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) return []

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        *,
        customers!inner (
          name,
          email
        )
      `)
      .eq('business_id', businessProfile.id)  // Add business_id filter
      .order('reservation_time', { ascending: false })

    if (error) {
      console.error('Reservations fetch error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw error
    }

    // Format the data to match  type
    const formattedData = reservations?.map(reservation => ({
      ...reservation,
      customer_name: reservation.customers.name,
      customers: {
        name: reservation.customers.name,
        email: reservation.customers.email
      }
    }))

    return formattedData || []

  } catch (error: any) {
    console.error('Failed to fetch reservations:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}


export async function getCustomers() {
  const supabase = createBrowserSupabaseClient()
  
  try {
    // First get the business profile
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) return []

    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        email,
        phone,
        total_visits,
        joined_date,
        reservation_id
      `)
      .eq('business_id', businessProfile.id)  // Add business_id filter
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      throw error
    }
  }

  export async function getCustomerById(id: string) {
    const supabase = createBrowserSupabaseClient()
    
    try {
      // Get business profile first
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .single()
  
      if (!businessProfile) throw new Error('No business profile found')
  
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          total_visits,
          joined_date
        `)
        .eq('id', id)
        .eq('business_id', businessProfile.id)  // Add business_id filter
        .single()

    if (customerError) throw customerError

    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_email', customer.email)
      .eq('business_id', businessProfile.id)  // Add business_id filter
      .order('reservation_time', { ascending: false })

    if (reservationsError) throw reservationsError

    return {
      ...customer,
      reservations: reservations || []
    }
  } catch (error) {
    console.error('Error fetching customer details:', error)
    throw error
  }
}


export async function updateReservationStatus(id: string, status: string) {
  const supabase = createBrowserSupabaseClient()
  
  try {
    // Get the business profile first
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')
    
    console.log('🔍 Attempting status update:', {
      id,
      status,
      business_id: businessProfile.id,
      timestamp: new Date().toISOString()
    })

    const { data, error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('reservation_id', id)
      .eq('business_id', businessProfile.id)
      .select()

    console.log('📝 Update response:', {
      success: !!data,
      data,
      error,
      timestamp: new Date().toISOString()
    })

    if (error) throw new Error(`Failed to update status: ${error.message}`)
      if (!data?.length) throw new Error(`No reservation found with ID: ${id}`)
      
      return data[0]
    } catch (error) {
      console.error('🚫 Update error:', error)
      throw error
    }
  }

  export async function createCustomer(customerData: {
    name: string;
    email: string;
    phone: string;
}) {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')
    
    try {
        // Check if the authenticated user has an associated business profile
        const { data: businessProfile, error: businessProfileError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('user_id', user.id) // Ensure you are checking the correct user
            .single();

        if (businessProfileError || !businessProfile) {
            throw new Error('No business profile found for the authenticated user');
        }
        console.log('Inserting customer with data:', customerData);
        // Insert the customer without specifying business_id
        const { data, error } = await supabase
            .from('customers')
            .insert([{
                ...customerData,
                total_visits: 0,
                joined_date: new Date().toISOString()
                // Do not include business_id here; it will be set by the trigger
            }])
            .select();

        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Failed to create customer:', error);
        throw error;
    }
}

  export async function createReservation(reservationData: CreateReservationData) {
    const supabase = createBrowserSupabaseClient()
    
    try {
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .single()
  
      if (!businessProfile) throw new Error('No business profile found')
  
      const { data, error } = await supabase
        .from("reservations")
        .insert([{
          ...reservationData,
          business_id: businessProfile.id,
          special_requests: reservationData.special_requests || null,
          dietary_restrictions: reservationData.dietary_restrictions || null,
        }])
        .select(`
          *,
          customers!inner (
            name,
            email
          )
        `)
  
      if (error) throw error
  
      const formattedData = data?.[0] ? {
        ...data[0],
        customer_name: data[0].customers.name,
        customers: {
          name: data[0].customers.name,
          email: data[0].customers.email
        }
      } : null
  
      return formattedData

  } catch (error: any) {
    console.error('Full error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      status: error?.status,
      statusCode: error?.statusCode,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}


// Business profiles
export async function getBusinessProfile() {
  const supabase = createBrowserSupabaseClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)  // Filter by authenticated user's ID
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data
  } catch (error: any) { // Type the error parameter
    if (error?.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching business profile:', error)
    throw error
  }
}

export async function upsertBusinessProfile(profileData: Partial<BusinessProfile>) {
  const supabase = createBrowserSupabaseClient()
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')

    // First check if user already has a business profile
    const { data: existingProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data, error } = await supabase
      .from('business_profiles')
      .upsert({
        id: existingProfile?.id, // Include existing ID if updating
        user_id: user.id,
        'restaurant-name': profileData['restaurant-name'],
        phone: profileData.phone,
        website: profileData.website,
        address: profileData.address,
        'operating-hours': profileData['operating-hours'],
        'capacity_info': profileData['capacity_info']
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      // Log detailed error information
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        payload: profileData,
        requestDetails: {
          table: 'business_profiles',
          operation: 'upsert',
          userId: user.id
        }
      })
      throw error
    }
    return data
  } catch (error: any) {
    // Log full error object and stack trace
    console.error('Full error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

// For TableCapacitySettings
export async function updateTableTypes(tableTypes: TableType[]) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Update business profile with table types
    const { data, error } = await supabase
      .from('business_profiles')
      .update({
        capacity_info: { table_types: tableTypes }
      })
      .eq('id', businessProfile.id)
      .select()

    if (error) throw error
    return data
  } catch (error: any) {
    console.error('Failed to update table types:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

export async function getTableTypes() {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('capacity_info')
      .single()

    if (!businessProfile?.capacity_info?.table_types) {
      return []
    }

    return businessProfile.capacity_info.table_types as TableType[]
  } catch (error: any) {
    // Log full error object and stack trace
    console.error('Failed to fetch table types:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

export async function updateWeeklySchedule(schedule: WeeklyScheduleState) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id, capacity_info')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Get table types from capacity_info
    const tableTypes = businessProfile.capacity_info?.table_types || []
    
    // Create a map for quick lookup
    const tableTypeMap = new Map(
      tableTypes.map((type: { id: any; name: any; }) => [type.id, type.name])
    )

    // Convert schedule to array of records
    const scheduleRecords = Object.entries(schedule).flatMap(([day, daySchedule]) => 
      daySchedule.enabled ? daySchedule.timeSlots.map(slot => ({
        business_id: businessProfile.id,
        day_of_week: getDayNumber(day),
        start_time: slot.start,
        end_time: slot.end,
        capacity_settings: {
          available_tables: slot.tables.map(table => ({
            tableTypeId: table.tableTypeId,
            tableTypeName: tableTypeMap.get(table.tableTypeId) || '',
            quantity: table.quantity
          }))
        }
      })) : []
    )

    // Delete existing records
    await supabase
      .from('reservation_settings')
      .delete()
      .eq('business_id', businessProfile.id)
      .is('specific_date', null)

    // Insert new records
    const { data, error } = await supabase
      .from('reservation_settings')
      .insert(scheduleRecords)

    if (error) throw error
    return data
  } catch (error: any) {
    // Log full error object and stack trace
    console.error('Failed to update weekly schedule:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

export async function updateDateSpecificSchedule(dateSchedule: DateSchedule) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id, capacity_info')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Get day of week from the specific date (0-6, where 0 is Sunday)
    const dayOfWeek = dateSchedule.date.getDay()

    // Convert schedule to array of records
    const scheduleRecords = dateSchedule.timeSlots.map(slot => ({
      business_id: businessProfile.id,
      specific_date: format(dateSchedule.date, 'yyyy-MM-dd'),
      day_of_week: dayOfWeek,
      start_time: slot.start,
      end_time: slot.end,
      capacity_settings: {
        available_tables: slot.tables.map(table => ({
          tableTypeId: table.tableTypeId,
          quantity: table.quantity
        }))
      }
    }))

    // Delete existing records for this date
    await supabase
      .from('reservation_settings')
      .delete()
      .eq('business_id', businessProfile.id)
      .eq('specific_date', format(dateSchedule.date, 'yyyy-MM-dd'))

    // Insert new records
    const { data, error } = await supabase
      .from('reservation_settings')
      .insert(scheduleRecords)
      .select()

    if (error) throw error
    return data
  } catch (error: any) {
    // Log full error object and stack trace
    console.error('Failed to update date-specific schedule:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

export async function getDateSpecificSchedule(date: Date) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id, capacity_info')
      .single()

    if (!businessProfile) return null

    const { data, error } = await supabase
      .from('reservation_settings')
      .select('*')
      .eq('business_id', businessProfile.id)
      .eq('specific_date', format(date, 'yyyy-MM-dd'))

    if (error) throw error

    return data ? {
      date,
      timeSlots: data.map(record => ({
        start: record.start_time,
        end: record.end_time,
        tables: record.capacity_settings.available_tables
      }))
    } : null
  } catch (error: any) {
    // Log full error object and stack trace
    console.error('Failed to fetch date-specific schedule:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

// Helper function to convert day string to number
function getDayNumber(day: string): number {
  const days = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 }
  return days[day as keyof typeof days]
}