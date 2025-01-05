import { ses, sns } from './config'
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
        // ToAddresses: [reservation.customer_email]
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

    // Send email using SES
    await ses.sendEmail(emailParams).promise()

    // Publish notification to SNS topic
    await sns.publish({
      TopicArn: process.env.AWS_SNS_TOPIC_ARN,
      Message: `
    New ${type} Reservation

    Customer: ${reservation.customers?.name}
    Email: ${reservation.customer_email}
    Date & Time: ${new Date(reservation.reservation_time).toLocaleString()}
    Status: ${reservation.status}
    Restaurant: ${profile['restaurant-name']}

    Reservation ID: ${reservation.reservation_id}
      `.trim(),
      Subject: `${profile['restaurant-name']} - New ${type} Reservation`,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: profile['restaurant-name']
            .replace(/[^a-zA-Z0-9-]/g, '') // Remove non-alphanumeric characters except hyphen
            .substring(0, 11) // Limit to 11 characters
            .replace(/^-|-$/g, 'R') // Replace leading/trailing hyphens with 'R'
        }
      }
    }).promise()

  } catch (error) {
    console.error('Failed to send reservation notification:', {
      error,
      credentials: {
        region: process.env.AWS_REGION,
        hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
      }
    })
    throw error
  }
}
