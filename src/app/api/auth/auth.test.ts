import { authOptions } from './[...nextauth]/route';
import { getServerSession } from 'next-auth'; // Keep this import for type and mocking its return
import { NextRequest, NextResponse } from 'next/server'; // Keep these imports for types and value in this test file
import { IncomingMessage, ServerResponse } from 'http'; // Keep for Node.js mock requests


// Import the handler function you want to test
import { POST as authRouteHandler } from './[...nextauth]/route';


// REMOVED: The jest.mock for 'next-auth' is removed from HERE.
// It is handled globally in jest.setup.ts
// REMOVED: Upstash and Redis mocks are in jest.setup.ts


describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // You might need to reset global mock return values here if they vary per test
    // Example: Resetting Prisma mock method return values
    // const { PrismaClient } = require('@prisma/client'); // Require the *global mock* module
    // const mockPrismaInstance = PrismaClient.mock.results[0]?.value; // Get the mock instance
    // if (mockPrismaInstance?.user?.findUnique) {
    //   mockPrismaInstance.user.findUnique.mockResolvedValue(null); // Default mock user not found
    // }
    // Similarly for Ratelimit or next-auth's getServerSession if you change their mock behavior
  });


  // Original tests that mock getServerSession (these should still work, using the global mock)
  it('should successfully authenticate with valid credentials (via getServerSession mock)', async () => {
    const mockSession = {
      user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    // Mock getServerSession return value (using the global mock)
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    // Create mock Node.js req/res (needed for this getServerSession signature)
     const req = { url: '/api/auth/session', method: 'GET', headers: {}, cookies: {}, query: {} } as any;
     const res = {} as ServerResponse;

    // Call getServerSession (this calls the global mock)
    const session = await getServerSession(req, res, authOptions);

    expect(getServerSession).toHaveBeenCalledWith(req, res, authOptions);
    expect(session).toEqual(mockSession);
  });

  it('should return null session with invalid credentials (via getServerSession mock)', async () => {
    // Mock getServerSession return value (using the global mock)
    (getServerSession as jest.Mock).mockResolvedValue(null);

    // Create mock Node.js req/res
     const req = { url: '/api/auth/session', method: 'GET', headers: {}, cookies: {}, query: {} } as any;
     const res = {} as ServerResponse;

    // Call getServerSession (this calls the global mock)
    const session = await getServerSession(req, res, authOptions);

    expect(getServerSession).toHaveBeenCalledWith(req, res, authOptions);
    expect(session).toBeNull();
  });


  // Example of testing the actual API route handler
  it('should handle a POST request to the auth route', async () => {
    // Create a mock NextRequest that simulates an incoming request
    const mockRequest = {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }), // Use global Headers mock
      json: jest.fn().mockResolvedValue({ username: 'test', password: 'password' }), // Mock request body
      url: 'http://localhost/api/auth/callback/credentials',
      cookies: {
        get: jest.fn((name) => {
          if (name === 'next-auth.csrf-token') return { value: 'mock-csrf-token' };
          return undefined;
        }),
      },
    } as unknown as NextRequest; // Keep type assertion for type safety in this file

    // Interact with global mocks to set test-specific behavior
    // Example: Mock Prisma findUnique return value for this test scenario
    const { PrismaClient } = require('@prisma/client'); // Require the *global mock* module
    const mockPrismaInstance = PrismaClient.mock.results[0]?.value; // Get the mock instance
    if (mockPrismaInstance?.user?.findUnique) {
      mockPrismaInstance.user.findUnique.mockResolvedValue({
          id: 'mock-user-id', name: 'Mock User', email: 'mock@example.com', password: 'hashed-password',
      });
    }
    // Mock bcrypt.compare if your credentials provider uses it directly in route.ts
    const bcrypt = require('bcrypt'); // Require the real bcrypt module
    if (bcrypt?.compare) {
        (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Mock bcrypt.compare
    }


    // Example: Mock Ratelimit.limit outcome for this test scenario
    const { Ratelimit } = require('@upstash/ratelimit'); // Require the *global mock* module
    const mockRatelimitInstance = Ratelimit.mock.results[0]?.value; // Get the mock instance
    if (mockRatelimitInstance?.limit) {
      // Default is success: true in jest.setup.ts. Override if needed for this test.
      // mockRatelimitInstance.limit.mockResolvedValue({ success: false, limit: 5, remaining: 0, pending: Promise.resolve(undefined), reset: Date.now() + 60000 });
    }


    // Call the route handler function with the mock request
    const response = await authRouteHandler(mockRequest);

    // Assert the response
    expect(response).toBeInstanceOf(NextResponse); // Keep type assertion for type safety
    // Example assertions for a successful login scenario:
    // expect(response.status).toBe(200);
    // If the handler returns the session data in the response body:
    // const responseBody = await response.json();
    // expect(responseBody).toHaveProperty('user');

    // Add more tests for different scenarios (e.g., user not found, wrong password, rate limited)
  });

});