// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* existing config options */
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Add SWC compiler options here if needed
  compiler: {
    // Any specific options you need
    // For example:
    styledComponents: true,
    // Other options can be added here
    //
    // For example:
    // reactRemoveProperties: true,
    // removeConsole: true,
    // removeDebugger: true,
    //reactRemoveProperties: true,
    //removeConsole: true,
    //removeDebugger: true,
    // Additional options can be added here
    // For example:
    // minify: true,
    // removeComments: true,
    // removeWhitespace: true,
    //minify: true,
    //removeComments: true,
    //removeWhitespace: true,
  },
};

export default nextConfig;
