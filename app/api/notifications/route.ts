import { NextResponse } from 'next/server'
import AWS from 'aws-sdk'

const credentials = new AWS.Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
})

const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  credentials,
  correctClockSkew: true
})

const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  credentials
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (data.emailParams) {
      try {
        await ses.sendEmail(data.emailParams).promise()
      } catch (error) {
        const emailError = error as AWS.AWSError // Type assertion for AWS errors
        console.error('SES Error:', emailError)
        return NextResponse.json({ 
          error: emailError.message || 'SES Error occurred' 
        }, { status: 500 })
      }
    }

    if (data.snsParams) {
      try {
        await sns.publish({
          TopicArn: process.env.AWS_SNS_TOPIC_ARN,
          Message: data.snsParams.message,
          Subject: data.snsParams.subject,
          MessageAttributes: data.snsParams.messageAttributes || {}
        }).promise()
      } catch (error) {
        const snsError = error as AWS.AWSError // Type assertion for AWS errors
        console.error('SNS Error:', snsError)
        return NextResponse.json({ 
          error: snsError.message || 'SNS Error occurred' 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 })
  }
}
