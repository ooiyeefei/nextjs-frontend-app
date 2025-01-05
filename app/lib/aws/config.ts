import AWS from 'aws-sdk'

export const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
}

export const ses = new AWS.SES({
  apiVersion: '2010-12-01',
  ...awsConfig
})

export const sns = new AWS.SNS({
  apiVersion: '2010-03-31',
  ...awsConfig
})
