// src/app/api/auth/auth.test.ts - expanded version
import { NextRequest } from 'next/server';
import { Response } from 'node-fetch';
import { Request } from 'node-fetch';
import { POST as authRouteHandler } from './[...nextauth]/route';
import nextAuthMock from '@/test/mocks/next-auth';
import prismaClientMock from '@/test/mocks/prisma';
import ratelimitMock from '@/test/mocks/upstash';
import bcrypt from 'bcrypt';
import { createUser } from '@/test/factories/user-factory';
import type { EnhancedUser } from '@/types/user';
// Mock bcrypt separately to avoid actual hashing
jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

describe('Auth Route Handler', () => {
  const standardUser = createUser({ 
    id: 'test-user-id', 
    email: 'test@example.com',
    roleId: 'test-role', 
    orgId: 'test-org',
    role: 'test-role'
  });

  

  const createAuthRequest = (path: string, body?: any) => {
    return new NextRequest(`http://localhost/api/auth/callback/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }) as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    nextAuthMock.setSession(null);
    ratelimitMock.setLimitResult({ success: true, limit: 5, remaining: 4 });
    prismaClientMock.user.findUnique.mockResolvedValue(standardUser);
    
    // Reset bcrypt mock
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  describe('Credentials Provider', () => {
    it('should successfully authenticate with valid credentials', async () => {
      // ARRANGE
      const mockRequest = createAuthRequest('credentials', { 
        email: standardUser.email, 
        password: 'password123' 
      });

      // Set up NextAuth to return a success response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: {
            id: standardUser.id,
            email: standardUser.email,
            name: standardUser.name
          }
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      expect(ratelimitMock.limitFn).toHaveBeenCalled();
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user.email).toBe(standardUser.email);
    });

    it('should reject authentication with invalid password', async () => {
      // ARRANGE
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const mockRequest = createAuthRequest('credentials', { 
        email: standardUser.email, 
        password: 'wrongpassword' 
      });

      // Set up NextAuth to return an error response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: "CredentialsSignin"
        }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error', 'CredentialsSignin');
    });

    it('should reject authentication when user is not found', async () => {
      // ARRANGE
      prismaClientMock.user.findUnique.mockResolvedValue(null);
      
      const mockRequest = createAuthRequest('credentials', { 
        email: 'nonexistent@example.com', 
        password: 'password123' 
      });

      // Set up NextAuth to return an error response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: "CredentialsSignin"
        }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error', 'CredentialsSignin');
    });

    it('should apply rate limiting for failed attempts', async () => {
      // ARRANGE
      // First set up rate limiter to simulate approaching the limit
      ratelimitMock.setLimitResult({ success: true, limit: 5, remaining: 1 });
      
      const mockRequest = createAuthRequest('credentials', { 
        email: standardUser.email, 
        password: 'wrongpassword' 
      });

      // Set up NextAuth to return an error response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: "CredentialsSignin"
        }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT - First attempt
      const response1 = await authRouteHandler(mockRequest);
      
      // Now set rate limiter to be exceeded
      ratelimitMock.setLimitResult({ success: false, limit: 5, remaining: 0 });
      
      // ACT - Second attempt
      const response2 = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response1.status).toBe(401); // First should return auth error
      expect(response2.status).toBe(429); // Second should be rate limited
      expect(await response2.text()).toBe('Too many requests');
    });
  });

  describe('Google Provider', () => {
    it('should successfully handle authentication with Google', async () => {
      // ARRANGE
      const mockRequest = createAuthRequest('google', {
        // Google OAuth typically passes these parameters
        state: 'randomStateValue',
        code: 'googleAuthCode'
      });

      // Set up NextAuth to return a success response with Google profile
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: {
            id: 'google-user-id',
            email: 'google-user@gmail.com',
            name: 'Google User',
            image: 'https://lh3.googleusercontent.com/photo.jpg'
          }
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user.email).toBe('google-user@gmail.com');
    });

    it('should handle new user signup via Google', async () => {
      // ARRANGE
      // Simulate a Google user not yet in our database
      prismaClientMock.user.findUnique.mockResolvedValue(null);
      
      // But NextAuth will create one for us
      const newGoogleUser = createUser({
        id: 'new-google-user',
        email: 'new-google-user@gmail.com',
        name: 'New Google User',
        image: 'https://lh3.googleusercontent.com/newphoto.jpg'
      });
      
      // Mock Prisma create
      prismaClientMock.user.create.mockResolvedValue(newGoogleUser);
      
      const mockRequest = createAuthRequest('google', {
        state: 'randomStateValue',
        code: 'googleAuthCode'
      });

      // Set up NextAuth to return a success response with the new user
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: {
            id: newGoogleUser.id,
            email: newGoogleUser.email,
            name: newGoogleUser.name,
            image: newGoogleUser.image
          }
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user.email).toBe(newGoogleUser.email);
    });

    it('should handle errors in Google authentication', async () => {
      // ARRANGE
      const mockRequest = createAuthRequest('google', {
        error: 'access_denied',
        error_description: 'User denied access'
      });

      // Set up NextAuth to return an error response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: "OAuthSignin"
        }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error', 'OAuthSignin');
    });

    it('should handle token refresh', async () => {
      // ARRANGE
      // Create a mock session for refresh
      const session = {
        user: {
          id: standardUser.id,
          email: standardUser.email,
          name: standardUser.name,
          role: standardUser.role,      
          orgId: standardUser.orgId     
        },
        expires: new Date(Date.now() + 3600000).toISOString(),
        accessToken: 'old-access-token',
        refreshToken: 'refresh-token'
      };
      
      nextAuthMock.setSession(session);
      
      const mockRequest = createAuthRequest('session');

      // Set up NextAuth to return a refreshed session
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          ...session,
          accessToken: 'new-access-token'
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('accessToken', 'new-access-token');
    });
  });

  describe('Email Provider', () => {
    it('should successfully handle authentication with Email', async () => {
      // ARRANGE
      const mockRequest = createAuthRequest('email', {
        email: standardUser.email,
        token: 'valid-email-verification-token'
      });

      // Set up NextAuth to return a success response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          user: {
            id: standardUser.id,
            email: standardUser.email,
            name: standardUser.name
          }
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('user');
      expect(responseBody.user.email).toBe(standardUser.email);
    });

    it('should handle email verification request', async () => {
      // ARRANGE
      const mockRequest = createAuthRequest('email', {
        email: standardUser.email
      });

      // Set up NextAuth to return a success response for sending email
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          ok: true,
          status: "verification-requested"
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(200);
      expect(nextAuthMock.mockHandler).toHaveBeenCalled();
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('status', 'verification-requested');
    });

    it('should reject with invalid token', async () => {
      // ARRANGE
      const mockRequest = createAuthRequest('email', {
        email: standardUser.email,
        token: 'invalid-token'
      });

      // Set up NextAuth to return an error response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: "Verification"
        }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(400);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error', 'Verification');
    });
  });

  describe('Edge Cases', () => {
    it('should handle callback without provider parameter', async () => {
      // ARRANGE
      const mockRequest = new Request('http://localhost/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }) as unknown as NextRequest;

      // Set up NextAuth to return an error response
      nextAuthMock.mockHandler.mockResolvedValueOnce(
        new Response(JSON.stringify({ 
          error: "Configuration" 
        }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        })
      );

      // ACT
      const response = await authRouteHandler(mockRequest);

      // ASSERT
      expect(response.status).toBe(500);
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error', 'Configuration');
    });

    it('should rate limit signin requests across providers', async () => {
      // ARRANGE
      ratelimitMock.setLimitResult({ success: false, limit: 5, remaining: 0 });
      
      // Test with different providers
      const credentialsRequest = createAuthRequest('credentials', { 
        email: standardUser.email, 
        password: 'password123' 
      });
      
      const googleRequest = createAuthRequest('google', {
        state: 'randomStateValue',
        code: 'googleAuthCode'
      });

      // ACT
      const credentialsResponse = await authRouteHandler(credentialsRequest);
      const googleResponse = await authRouteHandler(googleRequest);

      // ASSERT
      expect(credentialsResponse.status).toBe(429);
      expect(googleResponse.status).toBe(429);
      expect(await credentialsResponse.text()).toBe('Too many requests');
      expect(await googleResponse.text()).toBe('Too many requests');
    });
  });
});