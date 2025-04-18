import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      orgId: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role?: string;
    orgId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
    orgId?: string;
  }
}

import nodemailer from 'nodemailer';
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@/generated/prisma/client';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import { AuthOptions } from 'next-auth';

// Initialize Prisma client
const prisma = new PrismaClient();

// Create rate limiter for auth requests
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// Auth configuration
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          // Return user data
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roleId,
            orgId: user.orgId,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Invalid credentials');
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url);

        // Create mail transport
        const transport = nodemailer.createTransport(provider.server);

        try {
          // Send verification email
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n${url}\n\n`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Sign in to ${host}</h2>
                <p>Click the button below to sign in:</p>
                <a href="${url}" style="display: inline-block; background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                  Sign in
                </a>
                <p>If the button doesn't work, you can copy and paste this link:</p>
                <p style="word-break: break-all; color: #666;">${url}</p>
                <p>This link will expire in 24 hours.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('SEND_VERIFICATION_EMAIL_ERROR', error);
          throw new Error(`Failed to send verification email to ${email}`);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to the JWT token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to the session
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.orgId = token.orgId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to apply rate limiting
async function applyRateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const result = await ratelimit.limit(ip);

  if (!result.success) {
    return {
      limited: true,
      response: new NextResponse('Too many requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }),
    };
  }

  return {
    limited: false,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    },
  };
}

// Create Auth.js handler for App Router
const handler = NextAuth(authOptions);

// Export GET and POST handlers with rate limiting
export async function GET(req: NextRequest) {
  const rateLimit = await applyRateLimit(req);

  if (rateLimit.limited) {
    return rateLimit.response;
  }

  // Forward to NextAuth handler with proper typing
  return handler(req as any);
}

export async function POST(req: NextRequest) {
  const rateLimit = await applyRateLimit(req);

  if (rateLimit.limited) {
    return rateLimit.response;
  }

  // Forward to NextAuth handler with proper typing
  return handler(req as any);
}

// Note: getServerSideProps belongs in a separate page file, not in API routes
// This is only for reference and should be moved to appropriate page files
/*
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
*/
