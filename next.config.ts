import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', // This allows any path on that hostname
      },
    ]
  }
  /* config options here */
};

export default nextConfig;
