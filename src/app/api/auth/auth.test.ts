// src/app/api/auth/auth.test.ts
import { NextRequest } from 'next/server';
import { Request } from 'node-fetch';
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

      // 3. Create mock request using node-fetch Request
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
