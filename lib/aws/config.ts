import AWS from 'aws-sdk'

const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-southeast-1',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || ''
  })
}

AWS.config.update(awsConfig)

// Initialize services with explicit configuration
export const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  ...awsConfig
})

export const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  ...awsConfig
})
