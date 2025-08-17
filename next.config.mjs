/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  // Allow cross-origin requests from development network IP
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS ? process.env.ALLOWED_DEV_ORIGINS.split(',') : [],
  // Handle chunk load errors
  webpack: (config, { dev, isServer }) => {
    // Add error handling for chunk loading
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    // Remove the custom babel-loader rule that breaks SWC
    // config.module.rules.push({
    //   test: /\.(js|jsx|ts|tsx)$/,
    //   use: {
    //     loader: 'babel-loader',
    //     options: {
    //       plugins: [
    //         [
    //           'babel-plugin-transform-remove-console',
    //           {
    //             exclude: ['error', 'warn'],
    //           },
    //         ],
    //       ],
    //     },
    //   },
    // })

    return config
  },
  // Handle runtime errors
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Optimize images and assets
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Handle PWA and offline functionality
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  // Handle redirects for better error handling
  async redirects() {
    return [
      {
        source: '/error',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
