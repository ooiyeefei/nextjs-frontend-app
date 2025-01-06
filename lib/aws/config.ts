import AWS from 'aws-sdk'

const credentials = new AWS.Credentials({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
})

export const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  credentials
})

export const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  credentials
})