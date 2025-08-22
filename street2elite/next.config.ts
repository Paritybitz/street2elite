import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['scqlktwqcovlxvobqgkw.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
