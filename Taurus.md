# Elegant Testing Solution for Next.js Authentication API Routes

After analyzing your codebase, I see you're experiencing issues with testing your Next.js authentication routes. The main challenges include proper mocking of dependencies, type compatibility, and environmental setup. Let me propose a comprehensive solution.

## Overview of Solution

I'll restructure your testing approach to make it more:

- **Modular**: Separate concerns with dedicated mock factories
- **Type-safe**: Properly satisfy TypeScript interfaces
- **Maintainable**: Clear organization with minimal duplication
- **Scalable**: Easy to extend for new test scenarios

## 1. Create a Dedicated Test Utils Directory

```
└── src/
    └── test/
        ├── mocks/
        │   ├── next-auth.ts
        │   ├── prisma.ts
        │   ├── upstash.ts
        │   ├── next-server.ts
        │   └── index.ts
        ├── factories/
        │   └── user-factory.ts
        └── setup-env.ts
```

## 2. Improved Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup-env.ts'],
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!next-auth|jose|@panva/hkdf|uuid|preact-render-to-string|preact|node-fetch)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/test/(.*)$': '<rootDir>/src/test/$1',
    '^@/generated/(.*)$': '<rootDir>/node_modules/.prisma/client/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
};

module.exports = createJestConfig(customJestConfig);
```

## 3. Centralized Environment Setup

```typescript
// src/test/setup-env.ts
import { TextEncoder, TextDecoder } from 'util';

// Set up global DOM polyfills
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Mock global web APIs with type-safe implementations
import { mockWebAPIs } from './mocks/next-server';
mockWebAPIs();

// Configure mocks for external dependencies
import './mocks'; // This imports the index.ts that sets up all mocks
```

## 4. Type-Safe Mocks

```typescript
// src/test/mocks/next-server.ts
export function mockWebAPIs() {
  // Implement fully type-compliant mocks
  if (typeof globalThis.Request === 'undefined') {
    globalThis.Request = class MockRequest implements Request {
      readonly cache: RequestCache = 'default';
      readonly credentials: RequestCredentials = 'same-origin';
      readonly destination: RequestDestination = '';
      readonly headers = new Headers();
      readonly integrity: string = '';
      readonly keepalive: boolean = false;
      readonly method: string = 'GET';
      readonly mode: RequestMode = 'cors';
      readonly redirect: RequestRedirect = 'follow';
      readonly referrer: string = '';
      readonly referrerPolicy: ReferrerPolicy = 'no-referrer';
      readonly signal: AbortSignal = { aborted: false } as AbortSignal;
      readonly url: string = '';
      readonly bodyUsed: boolean = false;
      arrayBuffer(): Promise<ArrayBuffer> {
        return Promise.resolve(new ArrayBuffer(0));
      }
      blob(): Promise<Blob> {
        return Promise.resolve(new Blob());
      }
      clone(): Request {
        return new MockRequest();
      }
      formData(): Promise<FormData> {
        return Promise.resolve({} as FormData);
      }
      json(): Promise<any> {
        return Promise.resolve({});
      }
      text(): Promise<string> {
        return Promise.resolve('');
      }
      body: ReadableStream<Uint8Array> | null = null;
    };
  }

  // Implement Response and Headers similarly
  // ...
}
```

```typescript
// src/test/mocks/next-auth.ts
import { AuthOptions, Session } from 'next-auth';

// Factory function to create a mocked nextAuth handler
export function createMockNextAuth() {
  // Create a flexible mock that can be customized per test
  const mockHandler = jest.fn(async (req: Request) => {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  // Main NextAuth factory function
  const mockNextAuth = jest.fn((options: AuthOptions) => mockHandler);

  // Mock getServerSession with ability to return different session values
  const mockGetServerSession = jest.fn().mockResolvedValue(null);

  return {
    mockNextAuth,
    mockHandler,
    mockGetServerSession,
    // Helper to set a mock session for a test
    setSession: (session: Session | null) => {
      mockGetServerSession.mockResolvedValue(session);
    },
  };
}

// Setup next-auth mock
const nextAuthMock = createMockNextAuth();

jest.mock('next-auth', () => ({
  default: nextAuthMock.mockNextAuth,
  getServerSession: nextAuthMock.mockGetServerSession,
}));

export default nextAuthMock;
```

## 5. Test Data Factories

```typescript
// src/test/factories/user-factory.ts
import { User } from '@/generated/prisma/client';

interface UserFactoryProps {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
  orgId?: string;
}

export function createUser(props: UserFactoryProps = {}): User {
  return {
    id: props.id || 'test-user-id',
    email: props.email || 'test@example.com',
    name: props.name || 'Test User',
    password: props.password || '$2b$10$mockHashedPassword',
    roleId: props.roleId || 'user',
    orgId: props.orgId || 'test-org-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    image: null,
  };
}
```

## 6. Improved Auth Route Test

```typescript
// src/app/api/auth/auth.test.ts
import { NextRequest } from 'next/server';
import { POST as authRouteHandler } from './[...nextauth]/route';
import nextAuthMock from '@/test/mocks/next-auth';
import prismaClientMock from '@/test/mocks/prisma';
import ratelimitMock from '@/test/mocks/upstash';
import bcrypt from 'bcrypt';
import { createUser } from '@/test/factories/user-factory';

// Mock bcrypt separately to avoid actual hashing
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock returns to defaults
    nextAuthMock.setSession(null);
    ratelimitMock.setLimitResult({ success: true, limit: 5, remaining: 4 });
  });

  describe('POST handler', () => {
    it('should successfully handle authentication with valid credentials', async () => {
      // ARRANGE
      // 1. Create mock user
      const mockUser = createUser();

      // 2. Setup Prisma mock to return our user
      prismaClientMock.user.findUnique.mockResolvedValue(mockUser);

      // 3. Create mock request
      const mockRequest = new Request('http://localhost/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mockUser.email, password: 'password123' }),
      }) as unknown as NextRequest;

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      expect(ratelimitMock.limitFn).toHaveBeenCalled();
    });

    it('should return 429 when rate limited', async () => {
      // ARRANGE
      ratelimitMock.setLimitResult({ success: false, limit: 5, remaining: 0 });

      const mockRequest = new Request('http://localhost/api/auth/callback/credentials', {
        method: 'POST',
      }) as unknown as NextRequest;

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(429);
      expect(await response.text()).toBe('Too many requests');
    });
  });
});
```

## 7. Upstash Mock Implementation

```typescript
// src/test/mocks/upstash.ts
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset?: number;
}

class RatelimitMock {
  limitFn = jest.fn();

  constructor() {
    this.setLimitResult({ success: true, limit: 5, remaining: 4 });
  }

  setLimitResult(result: RateLimitResult) {
    this.limitFn.mockResolvedValue({
      ...result,
      reset: result.reset || Date.now() + 60000,
    });
  }
}

const ratelimitMock = new RatelimitMock();

// Mock the Ratelimit class and its static methods
jest.mock('@upstash/ratelimit', () => {
  const MockRatelimit = jest.fn(() => ({
    limit: ratelimitMock.limitFn,
  }));

  MockRatelimit.slidingWindow = jest.fn().mockImplementation((limit, duration) => ({
    limit,
    duration,
  }));

  return {
    Ratelimit: MockRatelimit,
  };
});

// Mock the Redis client
jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      mget: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
    }),
  },
}));

export default ratelimitMock;
```

## 8. Prisma Mock Implementation

```typescript
// src/test/mocks/prisma.ts
// Create a mock Prisma client instance with typed methods
const prismaClientMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  account: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock the PrismaClient constructor to return our mock instance
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaClientMock),
  };
});

// Mock the Prisma adapter
jest.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn().mockImplementation(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    linkAccount: jest.fn(),
    createSession: jest.fn(),
    getSessionAndUser: jest.fn(),
    updateSession: jest.fn(),
    deleteSession: jest.fn(),
    createVerificationToken: jest.fn(),
    useVerificationToken: jest.fn(),
  })),
}));

export default prismaClientMock;
```

## 9. Central Exports of All Mocks

```typescript
// src/test/mocks/index.ts
// Re-export all mocks for easy importing
export { default as nextAuthMock } from './next-auth';
export { default as prismaClientMock } from './prisma';
export { default as ratelimitMock } from './upstash';
```

## Benefits of This Solution:

1. **Better Organization**: Mocks are organized by external dependency, making it easy to find and update specific mocks.

2. **Type Safety**: All mocks implement the expected interfaces for better type checking.

3. **Flexibility**: Mock behaviors can be easily adjusted per test case.

4. **Reusability**: The test infrastructure can be reused across different test files.

5. **Clarity**: Tests have a clear Arrange-Act-Assert structure, making them easier to understand.

6. **Maintainability**: When external APIs change, you only need to update the mocks in one place.

7. **Scalability**: Adding tests for new scenarios is straightforward with the factory pattern and mock helpers.

This solution solves the current issues while providing a solid foundation for future test development. Each component is designed to be independent, well-typed, and easy to maintain.
