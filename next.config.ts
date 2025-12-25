import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**'
      }
    ],
    formats: ['image/avif', 'image/webp']
  }
};

export default nextConfig;
