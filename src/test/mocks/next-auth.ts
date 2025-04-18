import { AuthOptions, Session } from 'next-auth';
import { Response } from 'node-fetch';

// Create a mock handler function that NextAuth would normally return
const mockHandler = jest.fn(async (req: Request) => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

// Create the main NextAuth mock function
const mockNextAuth = jest.fn((options: AuthOptions) => mockHandler);

// Mock getServerSession with ability to return different session values
const mockGetServerSession = jest.fn().mockResolvedValue(null);

// Helper to set a mock session for a test
const setSession = (session: Session | null) => {
  mockGetServerSession.mockResolvedValue(session);
};

// Create the mock object with all the helpers
const nextAuthMock = {
  mockNextAuth,
  mockHandler,
  mockGetServerSession,
  setSession,
};

// This is the critical part - we need to mock the module correctly
jest.mock('next-auth', () => {
  // Make mockNextAuth the default export AND a named export
  // This handles both import NextAuth from 'next-auth'
  // and import { NextAuth } from 'next-auth' patterns
  return Object.assign(mockNextAuth, {
    default: mockNextAuth,
    getServerSession: mockGetServerSession,
  });
});

export default nextAuthMock;
