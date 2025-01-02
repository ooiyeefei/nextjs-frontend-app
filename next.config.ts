import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'tcidexsffobbjcoulmzt.supabase.co',
      pathname: '/storage/v1/object/public/**',
    }],
  },
  // Remove the headers and rewrites sections as they're not needed
  // when using Supabase storage directly
};

export default nextConfig;
