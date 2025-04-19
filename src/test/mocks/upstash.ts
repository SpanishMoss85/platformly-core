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
  // Define the mock constructor with proper typing
  const MockRatelimit = jest.fn(() => ({
    limit: ratelimitMock.limitFn,
  })) as jest.Mock & {
    slidingWindow: jest.Mock; // Add the slidingWindow property to the type
  };

  // Now TypeScript knows MockRatelimit has a slidingWindow property
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
