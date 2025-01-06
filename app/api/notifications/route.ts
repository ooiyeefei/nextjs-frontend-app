import { NextResponse } from 'next/server'
import AWS from 'aws-sdk'

// Add debug logging for environment variables
console.log('Environment Variables Check:', {
  hasRegion: !!process.env.AWS_REGION,
  regionValue: process.env.AWS_REGION,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  hasSesEmail: !!process.env.AWS_SES_FROM_EMAIL,
  hasTopicArn: !!process.env.AWS_SNS_TOPIC_ARN
})

// Configure AWS globally first
const awsConfig = {
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
  })
}

AWS.config.update(awsConfig)

// Initialize services after global config
const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  correctClockSkew: true
})

const sns = new AWS.SNS({
  apiVersion: '2010-03-31'
})

export async function POST(request: Request) {
  try {
    // Log AWS configuration state
    console.log('AWS Config State:', {
      region: AWS.config.region,
      hasCredentials: !!(AWS.config.credentials?.accessKeyId && AWS.config.credentials?.secretAccessKey)
    })

    const data = await request.json()
    
    if (data.emailParams) {
      try {
        await ses.sendEmail(data.emailParams).promise()
      } catch (error) {
        const emailError = error as AWS.AWSError
        console.error('SES Error:', {
          message: emailError.message,
          code: emailError.code,
          region: AWS.config.region,
          requestId: emailError.requestId
        })
        return NextResponse.json({ 
          error: emailError.message || 'SES Error occurred',
          details: emailError.code
        }, { status: 500 })
      }
    }

    // Rest of your code...
  } catch (error) {
    console.error('Request Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
