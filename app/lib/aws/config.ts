import AWS from 'aws-sdk'
import { NextResponse } from 'next/server'

const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

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
      // Now TypeScript knows error is of type Error
      console.log(error.message)
    } else {
      // Handle cases where the thrown value is not an Error object
      console.log('Unexpected error:', error)
    }
  }
}
