import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { getServerSession } from 'next-auth/next';
import { PrismaClient, Prisma } from '@/generated/prisma/client';
import { z } from 'zod';
import { getAuthorizedLaunchUrl } from '@/services/appLaunch';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Configure rate limiting
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// Properly define the Apollo response types
interface GraphQLResponse {
  body: {
    kind: string;
    singleResult: {
      data?: Record<string, any>;
      errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
        path?: Array<string | number>;
        extensions?: Record<string, any>;
      }>;
    };
  };
}

// Define the GraphQL schema
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    organization: Organization
    role: Role
  }

  type Organization {
    id: ID!
    name: String!
    users: [User]
  }

  type Role {
    id: ID!
    name: String!
    users: [User]
  }

  type Query {
    users: [User]
    user(id: ID!): User
    organizations: [Organization]
    organization(id: ID!): Organization
    myOrganization: Organization
    roles: [Role]
    role(id: ID!): Role
    applications: [Application]
  }

  type Mutation {
    createUser(name: String!, email: String!, organizationId: ID!, roleId: ID!): User
    updateUser(id: ID!, name: String, email: String, organizationId: ID, roleId: ID): User
    deleteUser(id: ID!): Boolean
    createOrganization(name: String!): Organization
    updateOrganization(id: ID!, name: String): Organization
    deleteOrganization(id: ID!): Boolean
    createRole(name: String!): Role
    updateRole(id: ID!, name: String): Role
    deleteRole(id: ID!): Boolean
    updateUserProfile(id: ID!, name: String, email: String): User
    getAuthorizedLaunchUrl(applicationId: ID!): String
  }

  type Application {
    id: ID!
    name: String!
    enabled: Boolean!
  }
`;

// Define resolvers
const resolvers = {
  Query: {
    users: async (_: any, __: any, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return prisma.user.findMany();
    },
    user: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return prisma.user.findUnique({
        where: {
          id: id,
        },
      });
    },
    organizations: async (_: any, __: any, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return prisma.organization.findMany();
    },
    organization: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return prisma.organization.findUnique({
        where: {
          id: id,
        },
      });
    },
    myOrganization: async (_: any, __: any, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }

      const user = await prisma.user.findUnique({
        where: {
          email: context.session.user.email,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return prisma.organization.findUnique({
        where: {
          id: user.orgId,
        },
      });
    },
    roles: async (_: any, __: any, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return prisma.role.findMany();
    },
    role: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return prisma.role.findUnique({
        where: {
          id: id,
        },
      });
    },
    applications: async (_: any, __: any, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      const applications = await prisma.$queryRaw<any[]>(Prisma.sql`SELECT * FROM applications WHERE enabled = TRUE`);
      return applications;
    },
  },
  Mutation: {
    createUser: (
      _: any,
      _args: { name: string; email: string; organizationId: string; roleId: string },
      context: any
    ) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return null;
    },
    updateUserProfile: async (_: any, args: { id: string; name: string; email: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }

      const schema = z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(50).optional(),
        email: z.string().email().optional(),
      });

      const { id, name } = schema.parse(args);

      if (context.session.user.id !== id) {
        throw new Error('Unauthorized: You can only update your own profile.');
      }

      return prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
      });
    },
    updateOrganization: async (_: any, args: { id: string; name: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }

      const schema = z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(50),
      });

      const { id, name } = schema.parse(args);

      const user = await prisma.user.findUnique({
        where: {
          email: context.session.user.email,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.orgId !== id) {
        throw new Error('Unauthorized: You can only update your own organization.');
      }

      return prisma.organization.update({
        where: {
          id: id,
        },
        data: {
          name: name,
        },
      });
    },
    deleteUser: (_: any, _id: { id: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return false;
    },
    createOrganization: (_: any, _params: { name: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return null;
    },
    deleteOrganization: (_: any, _id: { id: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return false;
    },
    createRole: (_: any, _params: { name: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return null;
    },
    updateRole: async (_: any, _params: { id: string; name: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return null;
    },
    deleteRole: (_: any, _id: { id: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }
      return false;
    },
    getAuthorizedLaunchUrl: async (_: any, { applicationId }: { applicationId: string }, context: any) => {
      if (!context.session?.user) {
        throw new Error('Unauthorized');
      }

      const userId = context.session.user.id;
      const organizationId = context.session.user.orgId;

      try {
        const launchUrl = await getAuthorizedLaunchUrl(userId, organizationId, applicationId);
        return launchUrl;
      } catch (error: any) {
        if (error.message === 'Application not found') {
          throw new Error('ApplicationNotFound');
        } else if (error.message === 'Organization not found') {
          throw new Error('OrganizationNotFound');
        } else if (error.message === 'User not found') {
          throw new Error('UserNotFound');
        } else if (error.message === 'Subscription not found') {
          throw new Error('SubscriptionNotFound');
        } else if (error.message === 'Unauthorized') {
          throw new Error('Unauthorized');
        } else {
          throw new Error('Failed to get authorized launch URL');
        }
      }
    },
  },
  User: {
    organization: async (user: any) => {
      return prisma.organization.findUnique({
        where: {
          id: user.orgId,
        },
      });
    },
    role: async (user: any) => {
      return prisma.role.findUnique({
        where: {
          id: user.roleId,
        },
      });
    },
  },
  Organization: {
    users: async (organization: any) => {
      return prisma.user.findMany({
        where: {
          orgId: organization.id,
        },
      });
    },
  },
  Role: {
    users: async (role: any) => {
      return prisma.user.findMany({
        where: {
          roleId: role.id,
        },
      });
    },
  },
};

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Helper function to create rate limit headers
const createRateLimitHeaders = (limit: number, remaining: number, reset: number): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };
};

// Helper function to handle rate limiting
const checkRateLimit = async (req: NextRequest) => {
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const result = await ratelimit.limit(ip);

  if (!result.success) {
    return {
      isLimited: true,
      response: new NextResponse(JSON.stringify({ message: 'Too many requests' }), {
        status: 429,
        headers: createRateLimitHeaders(result.limit, result.remaining, result.reset),
      }),
      rateLimit: result,
    };
  }

  return { isLimited: false, rateLimit: result };
};

// GET route handler
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(req);
  if (rateLimitResult.isLimited) {
    return rateLimitResult.response as NextResponse;
  }

  try {
    const session = await getServerSession();
    const body = await req.text();

    // Execute GraphQL operation
    const response = await server.executeOperation(
      {
        query: body,
        variables: {},
      },
      {
        contextValue: { session },
      }
    );

    // Parse the response
    const responseData =
      response.body.kind === 'single'
        ? {
            data: response.body.singleResult.data,
            errors: response.body.singleResult.errors,
          }
        : { errors: [{ message: 'Unexpected response format' }] };

    // Log errors if any
    if (responseData.errors) {
      console.error('GraphQL Errors:', responseData.errors);
    }

    // Return the response
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: createRateLimitHeaders(
        rateLimitResult.rateLimit.limit,
        rateLimitResult.rateLimit.remaining,
        rateLimitResult.rateLimit.reset
      ),
    });
  } catch (error: any) {
    console.error('Error in route handler:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
    });
  }
}

// POST route handler
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(req);
  if (rateLimitResult.isLimited) {
    return rateLimitResult.response as NextResponse;
  }

  try {
    const session = await getServerSession();
    const body = await req.json().catch(() => req.text());

    // Prepare GraphQL query
    const query = typeof body === 'string' ? body : JSON.stringify(body);

    // Execute GraphQL operation
    const response = await server.executeOperation(
      {
        query,
        variables: {},
      },
      {
        contextValue: { session: session ?? null },
      }
    );

    // Parse the response
    const responseData =
      response.body.kind === 'single'
        ? {
            data: response.body.singleResult.data,
            errors: response.body.singleResult.errors,
          }
        : { errors: [{ message: 'Unexpected response format' }] };

    // Return the response
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: createRateLimitHeaders(
        rateLimitResult.rateLimit.limit,
        rateLimitResult.rateLimit.remaining,
        rateLimitResult.rateLimit.reset
      ),
    });
  } catch (error: any) {
    console.error('Error in POST handler:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
    });
  }
}
