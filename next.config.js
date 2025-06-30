/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    images: { 
      unoptimized: true,
      domains: ['images.pexels.com', 'gateway.pinata.cloud']
    },
    experimental: {
      forceSwcTransforms: true,
    },
    swcMinify: true,
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
    output: 'standalone',
  };
  
  module.exports = nextConfig;