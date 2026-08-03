/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  // Image optimization domains
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
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

  // Custom webpack config for D3/Three.js compatibility
  webpack: (config, { isServer }) => {
    // Handle canvas for Three.js SSR compatibility
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];

    // Ensure D3 modules are transpiled correctly
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle Three.js GLSL shader imports
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });

    return config;
  },
};

module.exports = nextConfig;
