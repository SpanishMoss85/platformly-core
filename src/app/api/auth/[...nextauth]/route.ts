// @ts-ignore
import nodemailer from 'nodemailer';
import NextAuth from "next-auth";
import { getServerSession } from "next-auth/next"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google";
import { SessionStrategy } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const { email, password } = credentials;
        try {
          // Fetch user from Prisma
          const user = await prisma.user.findUnique({
            where: {
              email: email,
            },
          });
          if (!user) {
            return null;
          }
          // Compare password hashes
          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );
          if (!isPasswordValid) {
            return null;
          }
          // Return user object
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
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
        // Send email to user
        const transport = nodemailer.createTransport(provider.server);
        try {
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: `Sign in to ${host}\n${url}\n\n`,
            html: `
            <p>Sign in to <strong>${host}</strong></p>
            <a href="${url}">Sign in</a>
            `,
          });
        } catch (error) {
          console.error("SEND_VERIFICATION_EMAIL_ERROR", error);
          throw new Error(`Failed to send verification email to ${email}`);
        }
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

const handler = async (req: any, res: any) => {
  // Rate limit the API route
  const ip = req.headers.get("x-forwarded-for") ?? req.ip ?? "127.0.0.1";
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
  res.setHeader("X-RateLimit-Limit", limit.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", reset.toString());
  if (!success) {
    return new Response("Too many requests", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      },
    });
  }

  const nextAuthHandler = NextAuth(authOptions);
  return nextAuthHandler(req, res);
};

export { handler as GET, handler as POST };

// Example of how to check for user session in API routes
// You can use getServerSession in any of your API routes to protect them
export async function getServerSideProps(context: any) {
  const session = await getServerSession(context.req, context.res, authOptions)

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return {
    props: { session },
  }
}