import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'tcidexsffobbjcoulmzt.supabase.co',
      pathname: '/storage/v1/object/public/**',
    }],
    domains: ['tcidexsffobbjcoulmzt.supabase.co']
  }
};

export default nextConfig;
