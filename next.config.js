const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // For VPS deployment
  experimental: {
    turbopack: {
      root: __dirname, // Fix multiple lockfiles warning
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/types': path.resolve(__dirname, './types'),
    };
    return config;
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img-c.udemycdn.com' },
      { protocol: 'https', hostname: 'udemy-images.udemy.com' },
      { protocol: 'https', hostname: 'udemycdn.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'i.imgur.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Add other headers as needed from your original config
    ];
  },
  // Add redirects if needed from your original config
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },
};
