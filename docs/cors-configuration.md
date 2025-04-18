# CORS Configuration

This document describes the CORS configuration implemented in `next.config.ts`.

## Configuration

The `next.config.ts` file is configured to allow requests from a specific origin, which is set using the `NEXT_PUBLIC_FRONTEND_URL` environment variable. If the environment variable is not set, it defaults to `http://localhost:3000`.

```typescript
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
```

## TODO

-   **Make the CORS origin configurable:** Currently, the CORS origin is set using an environment variable. It would be better to allow multiple origins or use a more flexible configuration.

## Cleanup

-   No cleanup tasks are currently identified.