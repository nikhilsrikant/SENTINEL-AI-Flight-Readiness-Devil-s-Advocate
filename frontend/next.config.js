/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable experimental features for App Router
  experimental: {
    serverActions: true,
  },
  // Proxy API requests to FastAPI backend during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  // Custom webpack config for Three.js compatibility
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
