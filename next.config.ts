import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'tcidexsffobbjcoulmzt.supabase.co',
      pathname: '/storage/v1/object/public/**',
    }],
    domains: ['tcidexsffobbjcoulmzt.supabase.co']
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      aws4: false
    }
    return config
  }
};

// Add environment variable check outside the config
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SES_FROM_EMAIL',
    'AWS_SNS_TOPIC_ARN'
  ]
  
  const missing = requiredEnvVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    process.exit(1)
  }
}

export default nextConfig;
