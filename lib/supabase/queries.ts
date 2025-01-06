import { BusinessProfile, CreateProductData, CreateReservationData, Customer, DateSchedule, Product, Reservation, TableType, UpdateProductData, WeeklyScheduleState } from "types"
import { createBrowserSupabaseClient } from './client'
import { format } from 'date-fns';
import { sendReservationEmail } from "../aws/email-service";

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
      console.log('Getting customer by ID:', { 
        id,
        timestamp: new Date().toISOString() 
      })
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

    export async function updateCustomer(customerId: string, updateData: Partial<Customer> & { existing_email?: string }) {
      const supabase = createBrowserSupabaseClient()
      console.log('Updating customer:', {
        originalEmail: updateData.existing_email,
        newEmail: updateData.email
      })

      try {
        const { data: businessProfile } = await supabase
          .from('business_profiles')
          .select('id')
          .single()
    
        if (!businessProfile) throw new Error('No business profile found')
    
        // First update customer using the customer ID
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            email: updateData.email,
            name: updateData.name,
            phone: updateData.phone,
          })
          .eq('id', customerId)
          .eq('business_id', businessProfile.id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        // then update reservations using the existing email
        if (updateData.email && updateData.email !== updateData.existing_email) {
          const { error: reservationError } = await supabase
            .from('reservations')
            .update({ customer_email: updateData.email })
            .eq('customer_email', updateData.existing_email)
            .eq('business_id', businessProfile.id)

          if (reservationError) {
            console.error('Reservation update error:', reservationError)
            throw reservationError
          }
        }

        

        if (updateError) throw updateError

        return updatedCustomer

      } catch (error: any) {
        console.error('Failed to update customer:', {
          error,
          details: {
            name: error?.name,
            message: error?.message,
            stack: error?.stack,
            status: error?.status,
            statusCode: error?.statusCode
          }
        })
        throw error
      }
    }
     
    
    
    export async function deleteCustomer(customerId: string) {
      const supabase = createBrowserSupabaseClient()
      try {
        const { data: businessProfile } = await supabase
          .from('business_profiles')
          .select('id')
          .single()
    
        if (!businessProfile) throw new Error('No business profile found')
    
        const { error } = await supabase
          .from('customers')
          .delete()
          .match({
            id: customerId,
            business_id: businessProfile.id
          })
    
        if (error) throw error
        return true
      } catch (error: any) {
        console.error('Failed to delete customer:', {
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

  export async function createReservation(reservationData: CreateReservationData) {
    const supabase = createBrowserSupabaseClient()
    
    try {
      const { data: businessProfile } = await supabase
        .from('business_profiles')
        .select('id')
        .single()
  
      if (!businessProfile) throw new Error('No business profile found')
  
      // Call the stored procedure in supabase to check if customers exist, if not create new customer record
      const { data, error } = await supabase
      .rpc('create_reservation_with_customer', {
        p_customer_name: reservationData.customer_name,
        p_customer_email: reservationData.customer_email,
        p_phone: reservationData.phone,
        p_business_id: businessProfile.id,
        p_reservation_time: reservationData.reservation_time,
        p_party_size: reservationData.party_size,
        p_status: reservationData.status,
        p_special_requests: reservationData.special_requests,
        p_dietary_restrictions: reservationData.dietary_restrictions
      })

      if (error) throw error

    // Fetch the complete reservation data with customer info
    const { data: reservationWithCustomer, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        *,
        customers(name, email)
      `)
      .eq('reservation_id', data.reservation_id)
      .single()

    if (fetchError) throw fetchError

    // Format the data for email notification
    const formattedData = reservationWithCustomer ? {
      ...reservationWithCustomer,
      customer_name: reservationWithCustomer.customers?.name,
      customers: {
        name: reservationWithCustomer.customers?.name,
        email: reservationWithCustomer.customers?.email
      }
    } : null

    if (formattedData) {
      await sendReservationEmail(
        businessProfile.id,
        'create',
        businessProfile,
        formattedData
      )
    }
  
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

export async function updateReservation(reservationId: string, updateData: Partial<Reservation>) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    const { data, error } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('reservation_id', reservationId)
      .eq('business_id', businessProfile.id)
      .select(`
        *,
        customers!inner(name, email)
      `)
      .single()

    if (error) throw error

    if (data) {
      const formattedReservation: Reservation = {
        reservation_id: data.reservation_id,
        reservation_time: data.reservation_time,
        customer_email: data.customer_email,
        phone: data.phone,
        party_size: data.party_size,
        status: data.status,
        special_requests: data.special_requests,
        dietary_restrictions: data.dietary_restrictions,
        customers: {
          name: data.customers.name,
          email: data.customers.email
        }
      }

      await sendReservationEmail(
        businessProfile.id,
        'update',
        businessProfile,
        formattedReservation
      )
    }

    return data
  } catch (error: any) {
    console.error('Failed to update reservation:', {
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

export async function cancelReservation(reservationId: string) {
  const supabase = createBrowserSupabaseClient()
  
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Get the business profile
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Get reservation details before deletion
    const { data: reservationData } = await supabase
      .from('reservations')
      .select(`
        *,
        customers!inner(name, email)
      `)
      .eq('reservation_id', reservationId)
      .eq('business_id', businessProfile.id)
      .single()

    if (!reservationData) throw new Error('Reservation not found')

    // Format the reservation data
    const formattedReservation: Reservation = {
      reservation_id: reservationData.reservation_id,
      reservation_time: reservationData.reservation_time,
      customer_email: reservationData.customer_email,
      phone: reservationData.phone,
      party_size: reservationData.party_size,
      status: reservationData.status,
      special_requests: reservationData.special_requests,
      dietary_restrictions: reservationData.dietary_restrictions,
      customers: {
        name: reservationData.customers.name,
        email: reservationData.customers.email
      }
    }

    // Delete the reservation with both checks
    const { error } = await supabase
      .from('reservations')
      .delete()
      .match({
        reservation_id: reservationId,
        business_id: businessProfile.id
      })

    if (error) throw error

    // Send cancellation email after successful deletion
    await sendReservationEmail(
      businessProfile.id,
      'cancel',
      businessProfile,
      formattedReservation
    )


    return true
  }  catch (error: any) {
    console.error('Fail to cancel reservation:', {
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
        'capacity_info': profileData['capacity_info'],
        cancellation_policy: profileData.cancellation_policy,
        refund_policy: profileData.refund_policy,
        data_usage_disclaimer: profileData.data_usage_disclaimer
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

// For storage - logos
export async function uploadBusinessLogo(logoFile: File) {
  const supabase = createBrowserSupabaseClient()
  try {
    // Get business profile first
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Create a unique filename to avoid conflicts
    const fileExt = logoFile.name.split('.').pop()
    const fileName = `${businessProfile.id}/logo.${fileExt}`

    const { data, error
      : uploadError } = await supabase.storage
      .from('business-files')
      .upload(fileName, logoFile, {
        upsert: true,
        cacheControl: '3600',
        contentType: 'image/jpeg'
      })

    if (uploadError) throw uploadError
    return data
  } catch (error: any) {
    console.error('Failed to upload logo:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}

export async function getBusinessLogoUrl() {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) return null

    // First list files in the business's directory
    const { data: files, error: listError } = await supabase.storage
      .from('business-files')
      .list(`${businessProfile.id}`)

    if (listError) throw listError
    if (!files || files.length === 0) return null

    // Find the logo file
    const logoFile = files.find(file => file.name.includes('logo'))
    if (!logoFile) return null

    // Get public URL for the logo
    const { data, error } = await supabase.storage
      .from('business-files')
      .createSignedUrl(
        `${businessProfile.id}/${logoFile.name}`,
        3600
      )

    if (error) throw error
    return data?.signedUrl || null
  } catch (error: any) {
    console.error('Failed to fetch logo URL:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
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


export async function getProducts() {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()
    
    if (!businessProfile) return []

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessProfile.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Product[]
  } catch (error: any) {
    console.error('Error fetching products:', {
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

export async function getProductImageUrl(imagePath: string) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data } = await supabase.storage
      .from('product-catalogue')
      .createSignedUrl(imagePath, 3600) // 1 hour expiry

    return data?.signedUrl || null
  } catch (error: any) {
    console.error('Failed to get product image URL:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      fullError: JSON.stringify(error, null, 2)
    })
    return null
  }
}


export async function createProduct(productData: CreateProductData) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        business_id: businessProfile.id,
        tags: productData.tags || [],
        stock_quantity: productData.stock_quantity || 0
      }])
      .select()
      .single()

    if (error) throw error
    return data as Product
  } catch (error: any) {
    console.error('Error creating product:', {
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

export async function updateProduct(updateData: UpdateProductData) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    const { id, ...productData } = updateData
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .eq('business_id', businessProfile.id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  } catch (error: any) {
    console.error('Error updating product:', {
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

export async function deleteProduct(productId: string) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('business_id', businessProfile.id)

    if (error) throw error
    return true
  } catch (error: any) {
    console.error('Error deleting product:', {
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

export async function uploadProductImage(imageFile: File, category?: string) {
  const supabase = createBrowserSupabaseClient()
  try {
    // Get business profile first
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()
    
    if (!businessProfile) throw new Error('No business profile found')

    // Create a unique filename
    const fileExt = imageFile.name.split('.').pop()
    const categoryPath = category?.trim() || 'uncategorized'
    const fileName = `${businessProfile.id}/${categoryPath}/${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('product-catalogue')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error
    return fileName
  } catch (error: any) {
    console.error('Failed to upload product image:', {
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

export async function moveProductImage(
  oldImagePath: string,
  newCategory: string,
  businessId: string
) {
  const supabase = createBrowserSupabaseClient()
  try {
    // Extract filename from old path
    const fileName = oldImagePath.split('/').pop()
    if (!fileName) throw new Error('Invalid image path')

    // Create new path with new category
    const newImagePath = `${businessId}/${newCategory}/${fileName}`

    // Copy file to new location
    const { data: copyData, error: copyError } = await supabase.storage
      .from('product-catalogue')
      .copy(oldImagePath, newImagePath)

    if (copyError) throw copyError

    // Delete old file after successful copy
    const { error: deleteError } = await supabase.storage
      .from('product-catalogue')
      .remove([oldImagePath])

    if (deleteError) throw deleteError

    return newImagePath
  } catch (error) {
    console.error('Failed to move product image:', error)
    throw error
  }
}

export async function getProductCategories(currentCategory?: string | null) {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: businessProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .single()
    
    if (!businessProfile) return []

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('business_id', businessProfile.id)
      .not('category', 'is', null)

    if (error) throw error

    // Transform null categories to 'Uncategorized'
    const categories = [...new Set(data
      .map(item => item.category || 'Uncategorized')
      .filter(Boolean)
    )]
    
    // Add current category if it exists
    if (currentCategory && !categories.includes(currentCategory)) {
      categories.push(currentCategory)
    }

    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}