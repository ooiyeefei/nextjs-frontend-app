import { BusinessProfile, CreateProductData, CreateReservationData, User, DateSchedule, Product, Reservation, TableType, UpdateProductData, WeeklyScheduleState, BookingSettings, ReservationForTimeSlotGen } from "types"
import { createBrowserSupabaseClient } from './client'
import { endOfDay, format, startOfDay } from 'date-fns';
import { sendReservationEmail } from "../aws/email-service";
import { toast } from "@/components/ui/toast";
import { convertToUtc } from "../utils/date-and-time";

interface GetReservationsResponse {
  reservations: ReservationForTimeSlotGen[];
  error?: string;
}

export async function createInitialBusinessProfile() {
  const supabase = createBrowserSupabaseClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // First create user record
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: [user.email?.split('@')[0] || 'New User'],
        phone: [''],
        joined_date: new Date().toISOString(),
        is_business_user: true,
        is_external_cx: false,
        is_registered: true
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (userError) throw userError

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const slug = `business-${Date.now()}`

    // Create business profile
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .insert({
        name: 'Sample Business Name',
        slug: slug,
        address: 'Sample Address',
        min_allowed_booking_advance_hours: 3,
        max_allowed_booking_advance_hours: 336,
        allowed_cancellation_hours: 3,
        is_deposit_required: true,
        operating_hours: {
          Monday: "10:00AM - 10:00 PM",
          Tuesday: "10:00AM - 10:00 PM",
          Wednesday: "10:00AM - 10:00 PM",
          Thursday: "10:00AM - 10:00 PM",
          Friday: "10:00AM - 10:00 PM",
          Saturday: "10:00AM - 10:00 PM",
          Sunday: "10:00AM - 10:00 PM"
        },
        timezone: userTimezone,
        owner_user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (profileError) throw profileError

    // Create default reservation settings for each day
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6] // Sunday = 0, Monday = 1, etc.
    const reservationSettings = daysOfWeek.map(day => ({
      business_id: businessProfile.id,
      day_of_week: day,
      reservation_start_time: '10:00',
      reservation_end_time: '22:00',
      capacity_settings: { default: 0 },
      is_default: true,
      timeslot_length_minutes: 60
    }))

    const { error: settingsError } = await supabase
      .from('reservation_settings')
      .insert(reservationSettings)

    if (settingsError) throw settingsError

    return businessProfile
  } catch (error: any) {
    console.error('Failed to create initial business profile:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      fullError: JSON.stringify(error, null, 2)
    })
    throw error
  }
}



export async function getReservations() {
  const supabase = createBrowserSupabaseClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // First get the business profile for the authenticated user
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('owner_user_id', user?.id)
      .maybeSingle()

    console.log('business profile found:', businessProfile);

    if (profileError) throw profileError
    if (!businessProfile) throw new Error('No business profile found')

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        id,
        confirmation_code,
        date,
        timeslot_start,
        timeslot_end,
        party_size,
        status,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        deposit_amount,
        is_deposit_made,
        dietary_restrictions,
        special_occasions,
        special_requests,
        business_id
      `)
      .eq('business_id', businessProfile.id)  // Add business_id filter
      .order('date', { ascending: false })

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
      id: reservation.id,
      confirmation_code: reservation.confirmation_code,
      date: reservation.date,
      timeslot_start: reservation.timeslot_start,
      timeslot_end: reservation.timeslot_end,
      party_size: reservation.party_size,
      status: reservation.status,
      customer_id: reservation.customer_id,
      customer_name: reservation.customer_name,
      customer_email: reservation.customer_email,
      customer_phone: reservation.customer_phone,
      deposit_amount: reservation.deposit_amount,
      is_deposit_made: reservation.is_deposit_made,
      dietary_restrictions: reservation.dietary_restrictions,
      special_occasions: reservation.special_occasions,
      special_requests: reservation.special_requests,
      business_id: reservation.business_id
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

export async function getReservationsByBusinessId(
  businessId: string, startDate: Date, endDate: Date, restaurantTimezone: string
): Promise<GetReservationsResponse> {
  const supabase = createBrowserSupabaseClient()

  try {
    const utcStartDate = convertToUtc(startOfDay(startDate), restaurantTimezone);
    const utcEndDate = convertToUtc(endOfDay(endDate), restaurantTimezone);
    console.log('startDate: ', startDate);
    console.log('startOfDay(startDate): ', startOfDay(startDate));
    console.log('utcStartDate: ', utcStartDate);
    console.log('endDate: ', endDate);
    console.log('utcEndDate: ', utcEndDate);

    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('date, timeslot_start, timeslot_end, party_size')
      .eq('business_id', businessId)
      .gte('date', startOfDay(utcStartDate).toISOString())
      .lte('date', endOfDay(utcEndDate).toISOString())
      .in('status', ['new', 'cancelled', 'completed'])
      .order('timeslot_start', { ascending: true });

    if (error) throw error;

    console.log('supabase reservations: ', reservations);

    return { reservations: reservations as ReservationForTimeSlotGen[] };
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return { reservations: [], error: 'Failed to fetch reservations' };
  }
}

export async function getCustomers() {
  const supabase = createBrowserSupabaseClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No authenticated user')

    // get the business profile
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (profileError) throw profileError
    if (!businessProfile) throw new Error('No business profile found')

    const { data: customers, error } = await supabase
      .from('users')
      .select(`*`)
      .eq('business_id', businessProfile.id)
      .eq('is_business_user', false)

    if (error) throw error
    // Map the data to match User interface
    const formattedData = customers?.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      total_visits: customer.total_visits,
      joined_date: customer.joined_date,
      is_business_user: false,
      is_registered: customer.is_registered
    })) || []

    return formattedData
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
      .from('users')
      .select(`
          id,
          name,
          email,
          phone,
          total_visits,
          joined_date
        `)
      .eq('id', id)
      .eq('business_id', businessProfile.id)
      .single()

    if (customerError) throw customerError

    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_email', customer.email)
      .eq('business_id', businessProfile.id)  // Add business_id filter
      .order('date', { ascending: false })

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
      .eq('id', id)
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
      .from('users')
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

export async function updateCustomer(customerId: string, updateData: Partial<User> & { existing_email?: string }) {
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
      .from('users')
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
      .from('users')
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
      .select('*')
      .single()

    if (!businessProfile) {
      throw new Error('No business profile found')
    }

    if (!businessProfile['restaurant_name']) {
      throw new Error('Restaurant name is required in your business profile')
    }

    // First create or get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        email: reservationData.customer_email,
        name: [reservationData.customer_name],
        phone: [reservationData.customer_phone || ''],
        is_business_user: false,
        joined_date: new Date().toISOString(),
        business_id: businessProfile.id,
        is_registered: false
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (userError) throw userError

    // Fetch the complete reservation data with customer info
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        customer_id: user.id,
        customer_name: reservationData.customer_name,
        customer_email: reservationData.customer_email,
        customer_phone: reservationData.customer_phone,
        date: reservationData.date,
        timeslot_start: reservationData.timeslot_start,
        timeslot_end: reservationData.timeslot_end,
        party_size: reservationData.party_size,
        status: 'new',
        business_id: businessProfile.id,
        special_requests: reservationData.special_requests,
        dietary_restrictions: reservationData.dietary_restrictions
      })
      .select()
      .single()

    if (reservationError) throw reservationError

    // Format the data for email notification
    const formattedData = reservation ? {
      id: reservation.id,
      confirmation_code: reservation.confirmation_code,
      date: reservation.date,
      timeslot_start: reservation.timeslot_start,
      timeslot_end: reservation.timeslot_end,
      party_size: reservation.party_size,
      status: reservation.status,
      customer_id: user.id,
      customer_name: user.name[0],
      customer_email: user.email,
      customer_phone: user.phone[0],
      deposit_amount: reservation.deposit_amount,
      is_deposit_made: reservation.is_deposit_made,
      dietary_restrictions: reservation.dietary_restrictions,
      special_occasions: reservation.special_occasions,
      special_requests: reservation.special_requests,
      business_id: businessProfile.id,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at
    } : null

    if (formattedData) {
      try {
        if (!businessProfile.name) {
          toast({
            title: "Warning",
            description: "Restaurant name not set. Notification emails will not be sent.",
            variant: "destructive"
          })
          return formattedData
        }
        await sendReservationEmail(
          businessProfile.id,
          'create',
          businessProfile,
          formattedData
        )
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        toast({
          title: "Note",
          description: "Reservation created but notification email failed to send",
          variant: "destructive"
        })
      }
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
    throw new Error(error.message || 'Failed to create reservation')
  }
}

export async function calculateReservationTimeslots(date: string) {
  const supabase = createBrowserSupabaseClient()

  try {
    // Get the authenticated user first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No authenticated user')

    // Get the business profile for this specific user
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('owner_user_id', user.id)
      .single()

    if (profileError) throw profileError
    if (!businessProfile) throw new Error('No business profile found')

    // Get reservation settings
    const { data: settings, error: settingsError } = await supabase
      .from('reservation_settings')
      .select(`
        reservation_start_time,
        reservation_end_time,
        timeslot_length_minutes
      `)
      .eq('business_id', businessProfile.id)
      .eq('day_of_week', new Date(date).getDay())
      .eq('is_default', true)
      .single()

    if (settingsError) throw settingsError
    if (!settings) return []

    const timeslots = []
    const startTime = new Date(`${date}T${settings.reservation_start_time}`)
    const endTime = new Date(`${date}T${settings.reservation_end_time}`)
    const interval = settings.timeslot_length_minutes * 60 * 1000

    let currentTime = startTime
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + interval)
      timeslots.push({
        start: format(currentTime, 'HH:mm'),
        end: format(slotEnd, 'HH:mm')
      })
      currentTime = slotEnd
    }

    return timeslots
  } catch (error) {
    console.error('Failed to calculate timeslots:', error)
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

    if (error) {
      console.error('Supabase Update Error:', error);
      throw new Error(error.message);
    }

    if (data) {
      const formattedReservation: Reservation = {
        id: data.reservation_id,
        date: data.date,
        timeslot_start: data.timeslot_start,
        timeslot_end: data.timeslot_end,
        customer_id: data.customer_id,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        customer_name: data.customer_name,
        party_size: data.party_size,
        status: data.status,
        special_requests: data.special_requests,
        dietary_restrictions: data.dietary_restrictions,
        business_id: data.business_id
      }

      await sendReservationEmail(
        businessProfile.id,
        'update',
        businessProfile,
        formattedReservation
      )
    }

    console.log('Supabase Update Success:', data);
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
    const { data } = await supabase
      .from('reservations')
      .select(`
        *,
        customers!inner(name, email)
      `)
      .eq('reservation_id', reservationId)
      .eq('business_id', businessProfile.id)
      .single()

    if (!data) throw new Error('Reservation not found')

    // Format the reservation data
    const formattedReservation: Reservation = {
      id: data.reservation_id,
      date: data.date,
      timeslot_start: data.timeslot_start,
      timeslot_end: data.timeslot_end,
      customer_id: data.customer_id,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      customer_name: data.customer_name,
      party_size: data.party_size,
      status: data.status,
      special_requests: data.special_requests,
      dietary_restrictions: data.dietary_restrictions,
      business_id: data.business_id
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
  } catch (error: any) {
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
      .eq('owner_user_id', user.id)  // Filter by authenticated user's ID
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

export async function getBusinessProfileWithResSettings() {
  const supabase = createBrowserSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('business_profiles')
      .select(`
        *,
        reservation_settings (*)
      `)
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    if (!data) return null

    return {
      ...data,
      deposit_amount: data.deposit_amount ? Number(data.deposit_amount.toFixed(2)) * 100 : null
    }
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching business profile:', error)
    throw error
  }
}


function generateSlug(text: string): string {
  return String(text)
    .normalize('NFKD') // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // remove all accents
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
    .replace(/^-+|-+$/g, ''); // remove leading and trailing hyphens
}

export async function upsertBusinessProfile(profileData: Partial<BusinessProfile>) {
  const supabase = createBrowserSupabaseClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('No authenticated user')

    const slug = profileData.name ? generateSlug(profileData.name) : undefined

    // First check if user already has a business profile
    const { data: existingProfile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { data, error } = await supabase
      .from('business_profiles')
      .upsert({
        owner_user_id: user.id,
        name: profileData.name,
        slug: slug,
        cuisine: profileData.cuisine,
        address: profileData.address,
        operating_hours: profileData.operating_hours,
        cancellation_policy: profileData.cancellation_policy,
        refund_policy: profileData.refund_policy,
        general_policy: profileData.general_policy,
        data_usage_policy: profileData.data_usage_policy,
        min_allowed_booking_advance_hours: profileData.min_allowed_booking_advance_hours,
        max_allowed_booking_advance_hours: profileData.max_allowed_booking_advance_hours,
        allowed_cancellation_hours: profileData.allowed_cancellation_hours,
        is_deposit_required: profileData.is_deposit_required,
        timezone: profileData.timezone || 'UTC'
      }, {
        onConflict: 'owner_user_id'
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

// For booking rules
export async function getReservationSettings(): Promise<BookingSettings> {
  const supabase = createBrowserSupabaseClient()
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No authenticated user')

    // Get business profile settings
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select(`
        id,
        min_allowed_booking_advance_hours,
        max_allowed_booking_advance_hours,
        allowed_cancellation_hours
      `)
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (profileError) throw profileError
    if (!businessProfile) throw new Error('No business profile found')

    // Get reservation settings
    const { data: reservationSettings, error: settingsError } = await supabase
      .from('reservation_settings')
      .select(`
        day_of_week,
        timeslot_length_minutes,
        reservation_start_time,
        reservation_end_time,
        capacity_settings,
        is_default
        `)
      .eq('business_id', businessProfile.id)
      .eq('is_default', true)

    if (settingsError) throw settingsError

    return {
      min_allowed_booking_advance_hours: businessProfile.min_allowed_booking_advance_hours || 3,
      max_allowed_booking_advance_hours: businessProfile.max_allowed_booking_advance_hours || 336,
      allowed_cancellation_hours: businessProfile.allowed_cancellation_hours || 3,

      // All reservation settings
      settings: reservationSettings.map(setting => ({
        day_of_week: setting.day_of_week,
        timeslot_length_minutes: setting.timeslot_length_minutes,
        reservation_start_time: setting.reservation_start_time,
        reservation_end_time: setting.reservation_end_time,
        capacity_settings: setting.capacity_settings,
        is_default: setting.is_default
      }))
    }
  } catch (error) {
    console.error('Failed to fetch booking settings:', error)
    throw error
  }
}

export async function updateReservationSettings(settings: {
  timeslot_length_minutes: number;
  min_allowed_booking_advance_hours: number;
  max_allowed_booking_advance_hours: number;
  allowed_cancellation_hours: number;
}) {
  const supabase = createBrowserSupabaseClient()
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) throw new Error('No authenticated user')

    // Get business profile
    const { data: businessProfile, error: profileError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle()

    if (profileError) throw profileError
    if (!businessProfile) throw new Error('No business profile found')

    // Update business profile settings
    const { error: businessUpdateError } = await supabase
      .from('business_profiles')
      .update({
        min_allowed_booking_advance_hours: settings.min_allowed_booking_advance_hours,
        max_allowed_booking_advance_hours: settings.max_allowed_booking_advance_hours,
        allowed_cancellation_hours: settings.allowed_cancellation_hours
      })
      .eq('id', businessProfile.id)

    if (businessUpdateError) throw businessUpdateError

    // Update reservation settings
    const { data: reservationSettings, error: settingsError } = await supabase
      .from('reservation_settings')
      .update({
        timeslot_length_minutes: settings.timeslot_length_minutes
      })
      .eq('business_id', businessProfile.id)
      .eq('is_default', true)
      .select()

    if (settingsError) throw settingsError

    return reservationSettings
  } catch (error) {
    console.error('Failed to update reservation settings:', error)
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
      .from('reservation_settings')
      .update({
        capacity_settings: { table_types: tableTypes }
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
      .from('reservation_settings')
      .select('capacity_settings')
      .eq('is_default', true)
      .maybeSingle()

    if (!businessProfile?.capacity_settings?.table_types) {
      return []
    }

    return businessProfile.capacity_settings.table_types as TableType[]
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
      .from('reservation_settings')
      .select('id, capacity_settings')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Get table types from capacity_settings
    const tableTypes = businessProfile.capacity_settings?.table_types || []

    // Create a map for quick lookup
    const tableTypeMap = new Map(
      tableTypes.map((type: { id: any; name: any; }) => [type.id, type.name])
    )

    // Convert schedule to array of records
    const scheduleRecords = Object.entries(schedule).flatMap(([day, daySchedule]) =>
      daySchedule.enabled ? daySchedule.timeSlots.map(slot => ({
        business_id: businessProfile.id,
        day_of_week: getDayNumber(day),
        reservation_start_time: slot.reservation_start_time,
        reservation_end_time: slot.reservation_end_time,
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
      .from('reservation_settings')
      .select('id, capacity_settings')
      .single()

    if (!businessProfile) throw new Error('No business profile found')

    // Get day of week from the specific date (0-6, where 0 is Sunday)
    const dayOfWeek = dateSchedule.date.getDay()

    // Convert schedule to array of records
    const scheduleRecords = dateSchedule.timeSlots.map(slot => ({
      business_id: businessProfile.id,
      specific_date: format(dateSchedule.date, 'yyyy-MM-dd'),
      day_of_week: dayOfWeek,
      reservation_start_time: slot.reservation_start_time,
      reservation_end_time: slot.reservation_end_time,
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
      .from('reservation_settings')
      .select('id, capacity_settings')
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