import { createBrowserSupabaseClient } from '../supabase/client'
import { Reservation } from '@/types'

export async function sendReservationEmail(
  businessId: string,
  type: 'create' | 'update' | 'cancel',
  businessProfile: { id: any },
  reservation: Reservation
) {
  const supabase = createBrowserSupabaseClient()
  
  try {
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('*')
      .single()

    if (!profile) throw new Error('Business profile not found')

    const subject = {
      create: 'Reservation Confirmation',
      update: 'Reservation Update',
      cancel: 'Reservation Cancelled'
    }[type]

    const formattedDate = new Date(reservation.reservation_time).toLocaleString()

    // Prepare email content
    const emailParams = {
      Source: `${profile['restaurant-name']} <${process.env.AWS_SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: ['yeefeiooi+appNotification@gmail.com']
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: `
              <p>Dear ${reservation.customers?.name},</p>
              <p>Your reservation details:</p>
              <ul>
                <li>Date & Time: ${formattedDate}</li>
                <li>Party Size: ${reservation.party_size} guests</li>
                ${reservation.status ? `<li>Status: ${reservation.status}</li>` : ''}
                ${reservation.special_requests ? `<li>Special Requests: ${reservation.special_requests}</li>` : ''}
              </ul>
              <p>Restaurant: ${profile['restaurant-name']}</p>
              ${profile.address ? `<p>Address: ${profile.address}</p>` : ''}
              ${profile.phone ? `<p>Contact: ${profile.phone}</p>` : ''}
            `,
            Charset: 'UTF-8'
          }
        }
      }
    }

    const snsParams = {
      message: `
        New ${type} Reservation

        Customer: ${reservation.customers?.name}
        Email: ${reservation.customer_email}
        Date & Time: ${new Date(reservation.reservation_time).toLocaleString()}
        Status: ${reservation.status}
        Restaurant: ${profile['restaurant-name']}

        Reservation ID: ${reservation.reservation_id}
      `.trim(),
      subject: `${profile['restaurant-name']} - New ${type} Reservation`,
      messageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: profile['restaurant-name']
            .replace(/[^a-zA-Z0-9-]/g, '')
            .substring(0, 11)
            .replace(/^-|-$/g, 'R')
        }
      }
    }

    // Send notifications through the server-side API route
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailParams,
        snsParams
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send notifications')
    }

  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to send reservation notification:', {
        message: error.message,
        credentials: {
          region: process.env.AWS_REGION,
          hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
          hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
        }
      })
    }
    throw error
  }
}
