/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost:3000', '192.168.31.232:3000'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jeccsjazcfxyrbyxiqax.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
