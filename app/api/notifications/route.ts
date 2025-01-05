import { NextResponse } from 'next/server'
import { ses, sns } from '@/lib/aws/config'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Send email if emailParams is provided
    if (data.emailParams) {
      await ses.sendEmail(data.emailParams).promise()
    }

    // Send SMS notification if snsParams is provided
    if (data.snsParams) {
      await sns.publish({
        TopicArn: process.env.AWS_SNS_TOPIC_ARN,
        Message: data.snsParams.message,
        Subject: data.snsParams.subject,
        MessageAttributes: data.snsParams.messageAttributes || {}
      }).promise()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      console.log('Unexpected error:', error)
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
    }
  }
}
