// jest.setup.ts

// Polyfill TextEncoder and TextDecoder for Jest environment
import { TextDecoder, TextEncoder } from 'util';
Object.assign(globalThis, { TextDecoder, TextEncoder });

// Direct polyfill for Request, Response, Headers, and fetch
if (typeof globalThis.Request === 'undefined') {
  //@ts-expect-error - Adding methods to prototype
  globalThis.Request = class MockRequest {};
}
if (typeof globalThis.Response === 'undefined') {
  //@ts-expect-error - Adding methods to prototype
  globalThis.Response = class MockResponse {};
}
if (typeof globalThis.Headers === 'undefined') {
  //@ts-expect-error - Adding methods to prototype
  globalThis.Headers = class MockHeaders extends Map<string, string> {
    append(name: string, value: string): void {
      super.set(name, value);
    }
    has(name: string): boolean {
      return super.has(name);
    }
    get(name: string): string | undefined {
      return super.get(name);
    }
    set(name: string, value: string): this {
      super.set(name, value);
      return this;
    }
    delete(name: string): boolean {
      return super.delete(name);
    }
    forEach(callback: (value: string, key: string, map: Map<string, string>) => void, thisArg?: any): void {
      super.forEach(callback, thisArg);
    }
  };
}
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn();
}

// Import Next.js server types for use in mocks (using 'any' to avoid circular reference issues during setup)
// These types are needed for mock definitions but importing them directly can trigger Next.js internal code evaluation
// We use 'any' here as a workaround for setup file circularity issues
type NextRequest = any;
type NextResponse = any;

// Instead of including global mocks here, we'll import them in individual test files
// This makes tests more explicit about their dependencies

// GLOBAL MOCK: Mock Upstash Ratelimit
jest.mock('@upstash/ratelimit', () => {
  const mockRatelimitInstanceMethods = {
    limit: jest.fn().mockReturnValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    }),
  };
  const MockRatelimitConstructor = jest.fn(() => mockRatelimitInstanceMethods) as jest.Mock & {
    slidingWindow: jest.Mock;
  };
  Object.assign(MockRatelimitConstructor, {
    slidingWindow: jest.fn((limit, duration) => ({
      /* return value */
    })),
  });
  return { default: MockRatelimitConstructor, Ratelimit: MockRatelimitConstructor };
});

// GLOBAL MOCK: Mock Upstash Redis package separately
jest.mock('@upstash/redis', () => ({
  Redis: { fromEnv: jest.fn(() => ({ mget: jest.fn().mockResolvedValue([]) })) },
}));

// NEW GLOBAL MOCK: Mock the 'next-auth' module
// Moved from auth.test.ts to ensure it's available globally and early
// This mock provides a callable NextAuth function (default export)
jest.mock('next-auth', () => {
  // Define a mock handler that simulates the NextAuth handler's behavior
  // Use 'any' for types here to avoid importing Next.js server types in setup
  const mockNextAuthHandler = jest.fn(async (req: any) => {
    console.log('Mock NextAuth handler called with request method:', req?.method);
    // Return an object that simulates a NextResponse
    return {
      status: 200,
      json: async () => ({}),
      text: async () => '',
      headers: { 'Content-Type': 'application/json' },
    };
  });

  // Define the mock for the main NextAuth function (the default export)
  const MockNextAuthFunction = jest.fn((options: any) => {
    // Use 'any' for options type
    console.log('Mock NextAuth factory called with options:', options);
    return mockNextAuthHandler; // The NextAuth function returns the mock handler
  });

  // Return the exports of the 'next-auth' module
  return {
    default: MockNextAuthFunction, // Provide the mock NextAuth function as the default export
    getServerSession: jest.fn(), // Mock the getServerSession named export
    // Add other named exports from next-auth that your code uses if needed
  };
});

// Set longer timeout for tests
jest.setTimeout(10000);
