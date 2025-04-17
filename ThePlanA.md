# Project Overview

This development plan outlines the implementation of a secure, scalable full-stack application using Next.js. The system will feature a GraphQL API backend (integrated within Next.js API routes) managing users, organizations, applications, and subscriptions. It will leverage Prisma for database interactions, NextAuth.js for robust authentication and session management, and integrated API routes for logging. The goal is a flexible, maintainable system with role-based access control and third-party integrations.

## Table of Contents

*   [Core Architecture Components](#core-architecture-components)
*   [Development Plan](#development-plan)
    *   [Phase 1: Foundation & Core Entities](#phase-1-foundation--core-entities)
        *   [Task Group 1: Project Setup & Database Configuration](#task-group-1-project-setup--database-configuration)
        *   [Task Group 2: Core Authentication & Basic CRUD](#task-group-2-core-authentication--basic-crud)
    *   [Phase 2: RBAC & Enhanced Authentication](#phase-2-rbac--enhanced-authentication)
        *   [Task Group 1: Role-Based Access Control and Permissions](#task-group-1-role-based-access-control-and-permissions)
        *   [Task Group 2: Authentication Enhancements](#task-group-2-authentication-enhancements)
    *   [Phase 3: Admin Features & Application Management](#phase-3-admin-features--application-management)
        *   [Task Group 1: Admin Functionality](#task-group-1-admin-functionality)
        *   [Task Group 2: Organization-Application Management](#task-group-2-organization-application-management)
    *   [Phase 4: Stripe Integration & Subscription Management](#phase-4-stripe-integration--subscription-management)
        *   [Task Group 1: Stripe Core Integration](#task-group-1-stripe-core-integration)
        *   [Task Group 2: Subscription Lifecycle & Webhooks](#task-group-2-subscription-lifecycle--webhooks)
    *   [Phase 5: Advanced Security & System Finalization](#phase-5-advanced-security--system-finalization)
        *   [Task Group 1: API Logging Route Enhancements](#task-group-1-api-logging-route-enhancements)
        *   [Task Group 2: Advanced Security & Finalization](#task-group-2-advanced-security--finalization)
*   [Key Milestones & Deliverables](#key-milestones--deliverables)
    *   [Phase 1 Deliverables](#phase-1-deliverables)
    *   [Phase 2 Deliverables](#phase-2-deliverables)
    *   [Phase 3 Deliverables](#phase-3-deliverables)
    *   [Phase 4 Deliverables](#phase-4-deliverables)
    *   [Phase 5 Deliverables](#phase-5-deliverables)
*   [Testing Strategy](#testing-strategy)
    *   [Unit Testing](#unit-testing)
    *   [Integration Testing](#integration-testing-continued)
    *   [End-to-End Testing](#end-to-end-testing)
    *   [Security Testing](#security-testing)
*   [Deployment Considerations](#deployment-considerations)
    *   [Environment Configuration](#environment-configuration)
    *   [CI/CD Pipeline](#cicd-pipeline)
    *   [Monitoring & Maintenance](#monitoring--maintenance)
*   [Implementation Details for Role/Permission-Based UI Control](#implementation-details-for-rolepermission-based-ui-control)
    *   [Server-Side Implementation](#server-side-implementation)
    *   [Client-Side Implementation](#client-side-implementation)
*   [Risk Management](#risk-management)
    *   [Technical Risks](#technical-risks)
    *   [Mitigation Strategies](#mitigation-strategies)
*   [Conclusion](#conclusion)

## Core Architecture Components

*   **Framework**: Next.js with TypeScript (App Router preferred)
*   **API Layer**: GraphQL integrated with Next.js API Routes (e.g., using Apollo Server or GraphQL Yoga)
*   **Database**: PostgreSQL with Prisma ORM
*   **Authentication**: NextAuth.js (Credentials Provider, Google OAuth Provider)
*   **Authorization**: Role-Based Access Control (RBAC) implemented within API logic/middleware
*   **Integrations**: Stripe, SendGrid (potentially via NextAuth.js email provider)
*   **Logging**: API routes within Next.js for log ingestion and retrieval
*   **Testing**: Jest/Vitest for unit/integration tests, Playwright/Cypress for E2E tests
*   **Frontend Styling**: TailwindCSS

## Development Plan

### Phase 1: Foundation & Core Entities

#### Task Group 1: Project Setup & Database Configuration

*   **Initialize Next.js project with TypeScript configuration**
    *   Set up project structure using the App Router
    *   Configure TypeScript with strict type checking
    *   Establish linting rules (ESLint) and code formatting (Prettier) standards

*   **Database & ORM Configuration with Prisma**
    *   Set up Prisma and connect to PostgreSQL database
    *   Define Prisma schema (`schema.prisma`) with models and relations:
        *   `User` (with role, organization relations, link to NextAuth `Account`/`Session`)
        *   `Role` (enum-based or separate model)
        *   `Organization` (with owner relation)
        *   `Application` (with enabled flag, launchUrl)
        *   `OrganizationApplication` (join model)
        *   `Subscription` (with organization relation, Stripe IDs)
        *   NextAuth.js required models (`Account`, `Session`, `VerificationToken`)
    *   Generate and manage database migrations using `prisma migrate dev`
    *   Implement database seeding script (`prisma db seed`) for roles and admin user

*   **GraphQL API Route Setup**
    *   Integrate Apollo Server (or similar GraphQL server) with a Next.js API route handler (e.g., `/api/graphql`)
    *   Define initial GraphQL schema (SDL) matching Prisma models
    *   Configure GraphQL playground/client for development access

*   **API Logging Route Setup**
    *   Create API routes (e.g., `/api/logs/ingest`, `/api/logs/query`) within Next.js
    *   Implement basic log ingestion endpoint accepting structured JSON logs
    *   Design logging schema (timestamp, level, message, service, environment, context, userId, orgId)
    *   Set up basic file-based logging or integrate with a log management platform via the API route
    *   Create a client-side logging utility/hook to send logs to the `/api/logs/ingest` endpoint

*   **Example Logging Client Utility:**
    ```typescript
    // utils/logger.ts
    // Simple client-side or server-side logger utility

    interface LogMetadata {
      context?: string;
      userId?: string;
      orgId?: string;
      [key: string]: any; // Allow arbitrary metadata
    }

    async function sendLog(level: string, message: string, metadata: LogMetadata = {}) {
      const logPayload = {
        timestamp: new Date().toISOString(),
        level,
        message,
        service: process.env.NEXT_PUBLIC_SERVICE_NAME || 'app-frontend', // Example service name
        environment: process.env.NODE_ENV || 'development',
        ...metadata
      };

      try {
        // Use fetch API, works client/server side in Next.js
        await fetch('/api/logs/ingest', { // Assumes relative path works or define full URL
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add auth if needed, maybe internal API key for server-side logging
          },
          body: JSON.stringify(logPayload),
        });
      } catch (error) {
        // Fallback to console if API fails
        console.error('Failed to send log via API:', error);
        console.log('Log Payload:', logPayload); // Log locally as fallback
      }
    }

    export const logger = {
      log: (message: string, metadata?: LogMetadata) => {
        sendLog('info', message, metadata);
      },
      error: (message: string, error?: Error | any, metadata?: LogMetadata) => {
        const trace = error instanceof Error ? error.stack : undefined;
        sendLog('error', message, { ...metadata, trace });
      },
      warn: (message: string, metadata?: LogMetadata) => {
        sendLog('warn', message, metadata);
      },
      audit: (action: string, details: any, userId?: string, targetEntity?: string, targetId?: string) => {
        sendLog('audit', action, { userId, targetEntity, targetId, details });
      },
    };
    ```

#### Task Group 2: Core Authentication & Basic CRUD

*   **Authentication Implementation with NextAuth.js**
    *   Configure NextAuth.js main handler (`[...nextauth].ts`)
    *   Set up Credentials provider with secure password hashing (`bcrypt`)
    *   Set up Google OAuth provider
    *   Configure Prisma Adapter for NextAuth.js to store user/session data
    *   Implement email verification flow using NextAuth.js Email provider (with SendGrid or similar) or custom callbacks
    *   Utilize NextAuth.js session management (JWT or database sessions)
    *   Secure GraphQL resolvers/API routes using `getServerSession` or middleware checks

*   **Basic CRUD Operations**
    *   Implement GraphQL resolvers/API route handlers for `User`, `Organization`, `Application`
    *   Use Prisma Client for database interactions within resolvers/handlers
    *   Add input validation using libraries like `zod`

*   **Launch Authorization Logic**
    *   Implement `getAuthorizedLaunchUrl` GraphQL mutation or API route handler
    *   Fetch user session using NextAuth.js (`getServerSession`) to get user/organization ID
    *   Use Prisma to check organization-application assignments, application status, and subscription status
    *   Return appropriate URL or error messages

*   **Example `getAuthorizedLaunchUrl` Service Logic (conceptual):**
    ```typescript
    // services/appLaunch.ts (or within the API route/resolver)
    import { PrismaClient, SubscriptionStatus } from '@prisma/client'; // Assuming generated types
    import { logger } from '@/utils/logger'; // Import logger
    import { UnauthorizedError, NotFoundError } from '@/utils/errors'; // Custom error classes

    const prisma = new PrismaClient();

    export async function getAuthorizedLaunchUrlLogic(userId: string, appId: string): Promise<string> {
      // Get user with organization and active subscription details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: {
            include: {
              subscriptions: { // Fetch relevant subscriptions
                where: {
                  status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } // Use Prisma enum
                },
                orderBy: {
                  createdAt: 'desc' // Get the latest potentially active one
                },
                take: 1
              },
              assignedApps: { // Fetch assigned apps for the org
                where: { applicationId: appId }
              }
            }
          }
        }
      });

      if (!user || !user.organization) {
        logger.warn(`User ${userId} not found or not associated with an organization.`, { userId, appId });
        throw new UnauthorizedError('User is not associated with an organization');
      }

      const organization = user.organization;

      // Check if app is assigned to organization
      if (!organization.assignedApps || organization.assignedApps.length === 0) {
        logger.warn(`App ${appId} not assigned to organization ${organization.id}.`, { userId, appId, orgId: organization.id });
        throw new UnauthorizedError('Application is not assigned to this organization');
      }

      // Check if the specific application exists and is enabled
      const app = await prisma.application.findUnique({
        where: { id: appId }
      });

      if (!app) {
        logger.error(`Application ${appId} not found in database.`, { userId, appId, orgId: organization.id });
        throw new NotFoundError('Application not found');
      }

      if (!app.isEnabled) {
        logger.warn(`Application ${appId} is disabled. Access denied.`, { userId, appId, orgId: organization.id });
        throw new UnauthorizedError('Application is not available');
      }

      // Check subscription status
      const activeSubscription = organization.subscriptions?.[0];
      if (!activeSubscription) {
        logger.warn(`Organization ${organization.id} has no active subscription. Access denied.`, { userId, appId, orgId: organization.id });
        throw new UnauthorizedError('Organization does not have an active subscription');
      }

      // All checks passed, return the launch URL
      if (!app.launchUrl) {
         logger.error(`Application ${appId} launch URL is not configured.`, { userId, appId, orgId: organization.id });
         throw new UnauthorizedError('Application launch URL is not configured');
      }

      logger.log(`Authorized launch URL requested for app ${appId} by user ${userId}.`, { userId, appId, orgId: organization.id, url: app.launchUrl });
      return app.launchUrl;
    }
    ```

*   **Security Foundations**
    *   Implement security headers using middleware or a library like `helmet` adapted for Next.js API routes
    *   Configure CORS settings via Next.js config or API route options
    *   Set up basic rate limiting on API routes using a suitable library (e.g., `express-rate-limit` adapted via middleware, or Vercel Edge Middleware)
    *   Leverage NextAuth.js built-in CSRF protection

*   **Testing & Documentation**
    *   Set up Jest/Vitest for unit/integration testing of API routes, services, utils
    *   Write tests for authentication flows (mocking NextAuth.js)
    *   Create integration tests for CRUD operations hitting API routes/GraphQL endpoint
    *   Document API endpoints (GraphQL schema documentation, potentially OpenAPI spec for REST routes)
    *   Prepare `README.md` and `.env.example` files

### Phase 2: RBAC & Enhanced Authentication

#### Task Group 1: Role-Based Access Control and Permissions

*   **Feature Flag & Permissions System**
    *   Design a flexible permissions system (e.g., feature strings like `billing:manage`, `app:admin`) potentially stored in the database or config
    *   Implement dynamic permission checking logic based on user roles (from `User` model), subscription levels (linked via `Subscription` model), and possibly organization-specific flags
    *   Create a centralized permission checking utility/service function
    *   Define Prisma schema extensions for storing role permissions, feature flags if needed

*   **Example Permission Checking Utility:**
    ```typescript
    // utils/permissions.ts
    import { PrismaClient, RoleType, SubscriptionStatus } from '@prisma/client'; // Use generated types/enums
    // Assume FeatureFlag model exists if needed for dynamic flags per org
    // import { FeatureFlag } from '@prisma/client';

    const prisma = new PrismaClient();

    // Define role hierarchy and base permissions
    const rolePermissions: Record<RoleType, string[]> = {
      [RoleType.GOD_MODE]: ['*'], // All features
      [RoleType.ORG_OWNER]: ['billing:*', 'user:manage', 'app:assign', 'org:manage'],
      [RoleType.ORG_ADMIN]: ['user:manage', 'app:assign'],
      [RoleType.ADMIN]: ['app:view'], // Example: Basic app viewing
      [RoleType.POWER_USER]: ['app:view:basic'],
      [RoleType.USER]: ['app:view:basic'],
      [RoleType.GUEST]: []
    };

    // Check if a user has access to a specific feature key
    export async function hasPermission(userId: string, featureKey: string): Promise<boolean> {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true, // Assuming role is an enum or string on User model
          organization: {
            select: {
              id: true,
              subscriptions: {
                where: { status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING] } },
                select: { plan: { select: { includedFeatures: true } } } // Assuming Plan model linked to Subscription has features array
              },
              // featureFlags: { where: { featureKey: featureKey } } // Uncomment if using dynamic Org Feature Flags
            }
          }
        }
      });

      if (!user || !user.role) return false;

      // 1. Check Role-Based Permissions
      const userRolePermissions = rolePermissions[user.role] || [];
      if (checkPermissionList(userRolePermissions, featureKey)) {
        return true;
      }

      // If no organization context, stop here
      if (!user.organization) return false;
      const organization = user.organization;

      // 2. Check Organization-Specific Feature Flags (Optional)
      // if (organization.featureFlags?.some(flag => flag.enabled)) {
      //   return true;
      // }

      // 3. Check Subscription Plan Permissions
      const activeSubscription = organization.subscriptions?.[0];
      if (activeSubscription && activeSubscription.plan?.includedFeatures) {
        if (activeSubscription.plan.includedFeatures.includes(featureKey)) {
          return true;
        }
      }

      return false; // Default deny
    }

    // Helper to check a list of permissions against a required key, handling wildcards
    function checkPermissionList(grantedPermissions: string[], requiredPermission: string): boolean {
      if (grantedPermissions.includes('*')) return true; // Global wildcard

      const categoryWildcard = `${requiredPermission.split(':')[0]}:*`;
      if (grantedPermissions.includes(categoryWildcard)) return true; // Category wildcard

      return grantedPermissions.includes(requiredPermission); // Exact match
    }

    // Check if user can access/view a specific application (example specific check)
    export async function canAccessApplication(userId: string, appId: string): Promise<boolean> {
      // Example: Check if user has the generic 'app:view' permission OR specific 'app:view:<appId>'
      const hasGenericView = await hasPermission(userId, 'app:view');
      if (hasGenericView) return true;

      const hasSpecificView = await hasPermission(userId, `app:view:${appId}`);
      return hasSpecificView;

      // Could also add checks for OrganizationApplication assignment here if needed
    }
    ```

*   **UI Visibility Control with GraphQL Directives (If using GraphQL)**
    *   Implement GraphQL directive (e.g., `@requirePermission`) to annotate schema fields/mutations
    *   Create directive logic (using tools like `@graphql-tools/utils` mapSchema or similar) that calls the `hasPermission` utility based on context (user from NextAuth session)
    *   Modify GraphQL context setup in the API route to include the authenticated user session
    *   Pass permission requirements as metadata in the GraphQL response extensions for client-side use

*   **Example GraphQL Directive Implementation (Conceptual):**
    ```typescript
    // lib/graphql/directives/requirePermission.ts
    import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
    import { defaultFieldResolver, GraphQLSchema } from 'graphql';
    import { ForbiddenError } from 'apollo-server-errors'; // Or your preferred error type
    import { hasPermission } from '@/utils/permissions'; // Import your permission checker
    import { Session } from 'next-auth'; // Type for NextAuth session

    const directiveName = 'requirePermission';

    // Context interface expected in resolvers
    interface ResolverContext {
      session?: Session | null; // User session from NextAuth.js
      // other context properties...
    }

    export function requirePermissionDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {
      return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const directive = getDirective(schema, fieldConfig, directiveName)?.[0]; // Get the first instance

          if (directive) {
            const { feature } = directive; // Get arguments from directive usage in schema
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context: ResolverContext, info) {
              const user = context.session?.user;

              if (!user?.id) {
                throw new ForbiddenError('Authentication required.');
              }

              const permitted = await hasPermission(user.id, feature);

              if (!permitted) {
                // Option 1: Throw error
                 throw new ForbiddenError(`Missing required permission: ${feature}`);
                // Option 2: Return null (make field nullable in schema)
                // return null;
              }

              // User has permission, call original resolver
              return resolve(source, args, context, info);
            };

             // Add metadata for client-side checks (optional)
             if (!fieldConfig.extensions) fieldConfig.extensions = {};
             fieldConfig.extensions.requiresPermission = feature;

            return fieldConfig;
          }
          return fieldConfig; // Return unmodified field if directive not present
        },
      });
    }
    ```

*   **Example UI Permission Schema (GraphQL):**
    ```graphql
    # schema.graphql

    # Assume directive is defined:
    # directive @requirePermission(feature: String!) on FIELD_DEFINITION | OBJECT

    type Application {
      id: ID!
      name: String!
      description: String!
      launchUrl: String!
      # Admin-only field
      isEnabled: Boolean! @requirePermission(feature: "app:admin:manage")
      # Field only visible to users with billing permission
      pricingTier: String @requirePermission(feature: "billing:view")
    }

    type Mutation {
      # Only available to users with billing permissions
      updateSubscription(input: SubscriptionInput!): Subscription!
        @requirePermission(feature: "billing:manage")
    }

    # Define necessary input types and other types
    input SubscriptionInput {
        planId: ID!
    }

    type Subscription {
        id: ID!
        # other fields...
    }
    ```

*   **Client-Side Permission Integration**
    *   Use NextAuth.js `useSession` hook to get user data client-side
    *   Fetch user-specific permissions via a dedicated API route or GraphQL query upon login/session load, store in context or state management (e.g., Zustand, Redux)
    *   Create a React component (e.g., `PermissionGuard`) or hook (e.g., `useHasPermission`) that checks against the loaded permissions
    *   Conditionally render UI elements based on permission checks

*   **Example React Permission Component:**
    ```typescript
    // components/auth/PermissionGuard.tsx
    import React from 'react';
    import { useSession } from 'next-auth/react';
    import { usePermissions } from '@/hooks/usePermissions'; // Assume a hook that provides permissions

    // Example Spinner component
    const Spinner: React.FC<{size?: string}> = ({size}) => <div>Loading...</div>;

    interface PermissionGuardProps {
      feature: string; // The required permission key
      fallback?: React.ReactNode; // Optional fallback component/message
      children: React.ReactNode;
    }

    export const PermissionGuard: React.FC<PermissionGuardProps> = ({
      feature,
      fallback = null,
      children
    }) => {
      const { data: session, status } = useSession();
      // Assume usePermissions hook handles loading/fetching permissions
      const { permissions, isLoading: permissionsLoading } = usePermissions();

      if (status === 'loading' || permissionsLoading) {
        return <Spinner size="sm" />; // Show loading state
      }

      if (status === 'unauthenticated') {
        return <>{fallback}</>; // Not logged in, show fallback
      }

      // Check permission using the loaded list
      const hasAccess = permissions?.includes('*') || permissions?.includes(feature) || permissions?.includes(`${feature.split(':')[0]}:*`);

      return hasAccess ? <>{children}</> : <>{fallback}</>;
    };

    // Example Usage:
    // const UpdateSubscriptionButton = () => <button>Update Subscription</button>;
    //
    // <PermissionGuard feature="billing:manage">
    //   <UpdateSubscriptionButton />
    // </PermissionGuard>
    ```

*   **Complete RBAC System Implementation**
    *   Finalize role hierarchy and permission mappings
    *   Implement middleware or checks within API routes/GraphQL resolvers to enforce permissions using the `hasPermission` utility and NextAuth.js session data
    *   Create API routes/GraphQL mutations for role management (assign/revoke roles), protected by appropriate permissions (e.g., `user:manage:roles`)
    *   Apply permission checks consistently across all relevant API endpoints/resolvers

*   **Example API Route Middleware (Conceptual):**
    ```typescript
    // middleware/withPermissions.ts (Example helper, not standard Next.js middleware pattern)
    // Or implement directly in API route handlers

    import { NextApiRequest, NextApiResponse } from 'next';
    import { getServerSession } from 'next-auth/next';
    import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Your NextAuth options
    import { hasPermission } from '@/utils/permissions';
    import { ForbiddenError, UnauthorizedError } from '@/utils/errors';

    type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

    export function withPermissions(requiredFeature: string, handler: ApiHandler): ApiHandler {
      return async (req: NextApiRequest, res: NextApiResponse) => {
        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id) {
          return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
          // Or throw new UnauthorizedError('Authentication required.'); if using error handler middleware
        }

        const permitted = await hasPermission(session.user.id, requiredFeature);

        if (!permitted) {
           return res.status(403).json({ message: `Forbidden: Missing required permission: ${requiredFeature}` });
           // Or throw new ForbiddenError(`Missing required permission: ${requiredFeature}`);
        }

        // User has permission, proceed with the original handler
        await handler(req, res);
      };
    }

    // Usage in an API route:
    // import { withPermissions } from '@/middleware/withPermissions';
    //
    // const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    //   // Actual API logic here...
    //   res.status(200).json({ message: 'Success!' });
    // };
    //
    // export default withPermissions('user:manage', handler);
    ```

*   **Resource Access Control**
    *   Implement checks within API routes/resolvers to ensure users can only access/modify resources belonging to their own organization (unless they have `GOD_MODE` or specific cross-org permissions)
    *   Add ownership checks (e.g., ensuring only `ORG_OWNER` can modify certain organization settings)
    *   Create API endpoints/mutations for managing users within an organization (invite, remove, change role), protected by permissions like `user:manage`

#### Task Group 2: Authentication Enhancements

*   **OAuth Integration**
    *   Configure Google provider (and any others) fully within NextAuth.js options
    *   Ensure Prisma Adapter correctly handles account linking for users signing in via multiple methods (OAuth and Credentials)
    *   Test OAuth sign-up and sign-in flows

*   **Authentication Refinements**
    *   Implement password reset functionality:
        *   Create an API route to request password reset (generates token, sends email via SendGrid/NextAuth Email provider)
        *   Create a page/API route to handle the reset token and update the user's password (hashing appropriately)
    *   Implement email verification flow (if not using NextAuth Email provider directly):
        *   Generate verification token on signup or email change
        *   Send verification email
        *   Create API route/page to handle verification token
    *   Leverage NextAuth.js for session management (duration, refresh, etc.)
    *   Implement multi-device logout (requires custom logic, e.g., storing session identifiers linked to the user in the database and providing an endpoint to invalidate them)

*   **Testing & Validation**
    *   Write unit/integration tests for permission checking logic and RBAC enforcement
    *   Test OAuth flows thoroughly
    *   Test password reset and email verification workflows
    *   Validate session management behavior (expiry, refresh)
    *   Perform security testing on authentication/authorization endpoints

### Phase 3: Admin Features & Application Management

#### Task Group 1: Admin Functionality

*   **`GodMode` and Admin Capabilities**
    *   Implement API routes/GraphQL queries/mutations specifically for admin users (`GOD_MODE` role)
    *   Create user management endpoints (list users, view details, assign roles across organizations), protected by `GOD_MODE` role check
    *   Create organization management endpoints (list orgs, view details, potentially modify), protected by `GOD_MODE`
    *   Add endpoints for managing system-wide settings or configurations (if any)
    *   Implement administrative reporting queries (e.g., user counts, subscription summaries)

*   **Application Catalog Management**
    *   Create admin-only API routes/GraphQL mutations for CRUD operations on the `Application` model (create, update, delete applications in the catalog)
    *   Implement functionality to enable/disable applications system-wide
    *   Add fields for application metadata, configuration options, icons, etc. to the `Application` model/schema
    *   Consider batch operations for enabling/disabling multiple applications

#### Task Group 2: Organization-Application Management

*   **Application Assignment System**
    *   Implement API routes/GraphQL mutations for assigning/unassigning applications (`OrganizationApplication` model) to specific organizations (accessible by `GOD_MODE` or `ORG_OWNER`/`ORG_ADMIN` with `app:assign` permission)
    *   Create bulk assignment capabilities (assigning one app to multiple orgs, or multiple apps to one org)
    *   Consider adding tracking/history for assignments
    *   Implement validation rules (e.g., prevent assigning disabled apps)

*   **Admin Interface Enhancements**
    *   Structure GraphQL schema or API routes logically to separate admin operations
    *   Enhance GraphQL playground/client documentation for admin endpoints
    *   Provide clear examples for common admin tasks

*   **Testing & Validation**
    *   Write unit/integration tests for all admin API routes/resolvers
    *   Test application catalog management and assignment flows
    *   Validate that only users with appropriate admin roles (`GOD_MODE`, relevant `ORG_OWNER`/`ORG_ADMIN` permissions) can access admin functionality

### Phase 4: Stripe Integration & Subscription Management

#### Task Group 1: Stripe Core Integration

*   **Stripe Setup**
    *   Integrate official `stripe` Node.js library into the Next.js backend (API routes/server functions)
    *   Set up API routes/service functions for creating/updating Stripe Customers and linking them to `Organization` records via `stripeCustomerId` field in Prisma
    *   Implement robust error handling for Stripe API calls

*   **Example Stripe Service Logic (Conceptual):**
    ```typescript
    // services/stripeService.ts
    import { PrismaClient, Organization, Subscription, SubscriptionStatus } from '@prisma/client';
    import Stripe from 'stripe';
    import { getConfig } from '@/utils/config'; // Helper to get env vars
    import { logger } from '@/utils/logger';
    import { NotFoundError, BadRequestError, InternalServerError, PaymentError } from '@/utils/errors'; // Custom errors

    const prisma = new PrismaClient();
    const config = getConfig(); // Load STRIPE_SECRET_KEY etc.
    const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' }); // Use target version

    // Ensure Organization has stripeCustomerId field in schema.prisma
    // Ensure Subscription has stripeSubscriptionId, stripePriceId, status etc.

    export async function getOrCreateStripeCustomer(organizationId: string): Promise<string> {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { owner: true } // Need owner email
      });

      if (!organization) {
        throw new NotFoundError(`Organization not found: ${organizationId}`);
      }

      if (organization.stripeCustomerId) {
        return organization.stripeCustomerId;
      }

      if (!organization.owner?.email) {
          throw new BadRequestError(`Organization ${organizationId} owner email is missing.`);
      }

      try {
        const customer = await stripe.customers.create({
          name: organization.name,
          email: organization.owner.email,
          metadata: {
            organizationId: organization.id,
          },
        });

        await prisma.organization.update({
          where: { id: organizationId },
          data: { stripeCustomerId: customer.id },
        });

        logger.audit('stripe_customer_created', { customerId: customer.id }, organization.ownerId ?? 'system', 'organization', organizationId);
        return customer.id;

      } catch (error) {
        handleStripeError(error, 'createStripeCustomer', { organizationId });
      }
    }

    export async function createStripeSubscription(
        organizationId: string,
        priceId: string,
        paymentMethodId: string // Often handled client-side with setup intents now
    ): Promise<Subscription> { // Return our local Subscription record
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundError(`Organization not found: ${organizationId}`);
      }

      const stripeCustomerId = organization.stripeCustomerId ?? await getOrCreateStripeCustomer(organizationId);

      try {
         // Modern Stripe: Often payment method is attached client-side or via Setup Intents.
         // This example assumes PM ID is passed, which might be for first payment.
         // Attach PM to customer & set as default (handle idempotency if needed)
         await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
         await stripe.customers.update(stripeCustomerId, {
             invoice_settings: { default_payment_method: paymentMethodId },
         });

         // Create the subscription in Stripe
         const stripeSubscription = await stripe.subscriptions.create({
             customer: stripeCustomerId,
             items: [{ price: priceId }],
             payment_behavior: 'default_incomplete', // Recommended: handle payment confirmation client-side or via webhook
             expand: ['latest_invoice.payment_intent'], // Needed to check initial payment status
             metadata: {
                 organizationId: organizationId,
             }
         });

         // Create local subscription record
         const subscription = await prisma.subscription.create({
           data: {
             organizationId: organizationId,
             stripeSubscriptionId: stripeSubscription.id,
             stripePriceId: priceId,
             status: mapStripeStatus(stripeSubscription.status), // Map Stripe status to your enum
             planType: 'RECURRING', // Determine based on price or needs
             startDate: new Date(stripeSubscription.current_period_start * 1000),
             endDate: new Date(stripeSubscription.current_period_end * 1000),
             // Potentially link to a Plan model based on priceId
           }
         });

         logger.audit(
           'subscription_created',
           { subscriptionId: subscription.id, stripeSubscriptionId: stripeSubscription.id, status: stripeSubscription.status },
           'system', // Or user ID if initiated by user action
           'organization',
           organizationId
         );

         // Important: Handle the payment intent status from stripeSubscription.latest_invoice.payment_intent
         // Requires further client-side action or webhook handling if status is 'requires_action'

         return subscription;

      } catch (error) {
        handleStripeError(error, 'createStripeSubscription', { organizationId, priceId });
      }
    }

    function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
        // Map Stripe status strings to your Prisma SubscriptionStatus enum
        switch (stripeStatus) {
            case 'active': return SubscriptionStatus.ACTIVE;
            case 'trialing': return SubscriptionStatus.TRIALING;
            case 'past_due': return SubscriptionStatus.PAST_DUE;
            case 'canceled': return SubscriptionStatus.CANCELED;
            case 'unpaid': return SubscriptionStatus.UNPAID;
            case 'incomplete': return SubscriptionStatus.INCOMPLETE;
            case 'incomplete_expired': return SubscriptionStatus.INCOMPLETE_EXPIRED;
            default: return SubscriptionStatus.INACTIVE; // Or some other default/unknown status
        }
    }

    function handleStripeError(error: any, context: string, metadata: object = {}): never {
      logger.error(`Stripe API Error in ${context}`, error, metadata);
      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeCardError':
            throw new PaymentError(`Payment failed: ${error.message}`, error.code);
          case 'StripeRateLimitError':
            throw new InternalServerError('Stripe rate limit exceeded. Please try again later.');
          case 'StripeInvalidRequestError':
            throw new BadRequestError(`Invalid request to Stripe: ${error.message}`);
          case 'StripeAPIError':
          case 'StripeConnectionError':
          case 'StripeAuthenticationError':
            throw new InternalServerError('Stripe service error. Please try again later.');
          default:
            throw new InternalServerError('An unexpected payment processing error occurred.');
        }
      }
      // Re-throw non-Stripe errors
      throw error;
    }
    ```

*   **Subscription Management**
    *   Create API routes/GraphQL mutations for creating subscriptions (using the service logic above)
    *   Handle recurring subscriptions via Stripe's automated billing
    *   Implement logic for free trial subscriptions (using Stripe's trial features)
    *   Potentially add one-time payment functionality using Stripe Payment Intents if needed for non-recurring items

#### Task Group 2: Subscription Lifecycle & Webhooks

*   **Webhook Implementation**
    *   Create a Next.js API route (e.g., `/api/webhooks/stripe`) to receive Stripe webhook events
    *   Use `stripe.webhooks.constructEvent` with the raw request body and signature header for verification
    *   Implement handlers within the webhook route for relevant Stripe events (`customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `checkout.session.completed`, etc.)
    *   Update local database records (`Subscription` status, `endDate`, etc.) based on webhook events using Prisma

*   **Example Stripe Webhook API Route Handler:**
    ```typescript
    // pages/api/webhooks/stripe.ts (or app/api/webhooks/stripe/route.ts in App Router)
    import { NextApiRequest, NextApiResponse } from 'next';
    import Stripe from 'stripe';
    import { buffer } from 'micro'; // Helper to read raw body
    import { getConfig } from '@/utils/config';
    import { logger } from '@/utils/logger';
    import { handleSubscriptionUpdated, handleSubscriptionCanceled, handlePaymentSucceeded, handlePaymentFailed } from '@/services/stripeWebhookHandlers'; // Import handlers

    const config = getConfig();
    const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' });
    const webhookSecret = config.stripeWebhookSecret;

    // Disable Next.js body parsing for this route to access the raw body
    export const config = {
      api: {
        bodyParser: false,
      },
    };

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
      }

      const sig = req.headers['stripe-signature'] as string;
      if (!sig) {
         logger.error('Stripe webhook error: Missing stripe-signature header');
         return res.status(400).send('Webhook Error: Missing stripe-signature header');
      }

      let event: Stripe.Event;

      try {
        const buf = await buffer(req); // Read the raw body
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

        logger.audit('stripe_webhook_received', { type: event.type, eventId: event.id }, 'system', 'webhook', event.id);

        // Handle the event
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
            break;
          case 'customer.subscription.deleted':
            await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
            break;
          case 'invoice.payment_succeeded':
            await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
            break;
          case 'invoice.payment_failed':
            await handlePaymentFailed(event.data.object as Stripe.Invoice);
            break;
          // case 'checkout.session.completed': // Handle successful checkout session
          //   await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          //   break;
          // Add other event handlers as needed
          default:
            logger.log(`Unhandled Stripe webhook event type: ${event.type}`, { eventId: event.id });
        }

        // Return a 200 response to acknowledge receipt
        res.status(200).json({ received: true });

      } catch (err: any) {
        logger.error(`Stripe webhook error: ${err.message}`, err, { signature: sig });
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
    }
    ```

*   **Subscription Status Management**
    *   Enhance the `getAuthorizedLaunchUrl` logic (API route/resolver) to strictly check the `Subscription.status` (e.g., only `ACTIVE` or `TRIALING`) and potentially `endDate`
    *   Implement subscription status checks in other relevant services/API routes/guards where access depends on an active subscription
    *   Add user notifications (e.g., email via SendGrid triggered from webhook handlers) for events like upcoming renewals, payment failures, subscription cancellations
    *   Implement logic for handling payment failures (e.g., updating status to `PAST_DUE`, notifying user, potentially restricting access after a grace period based on Stripe's dunning settings and webhook events)

*   **Testing & Validation**
    *   Write unit/integration tests for Stripe service functions and webhook handlers (mocking Stripe API calls and Prisma)
    *   Use the Stripe CLI (`stripe listen`) to forward webhook events to your local development environment for testing
    *   Test the full subscription lifecycle: trial -> active, payment success, payment failure -> past_due -> unpaid/canceled, direct cancellation, reactivation (if applicable)
    *   Validate payment flows using Stripe test cards and test clocks in a staging environment

### Phase 5: Advanced Security & System Finalization

#### Task Group 1: API Logging Route Enhancements

*   **Logging API Query Route Completion**
    *   Enhance the `/api/logs/query` Next.js API route to support filtering logs by level, timestamp range, service name, text search, userId, organizationId, etc.
    *   Implement pagination for log retrieval
    *   Secure the query endpoint using NextAuth.js session checks and RBAC (e.g., only `GOD_MODE` or `ORG_OWNER`/`ORG_ADMIN` can query, filtering by organization for non-`GOD_MODE`)
    *   Consider integrating with a dedicated logging database/service (e.g., Elasticsearch, Loki) behind the API route for better performance and query capabilities if volume is high, otherwise query directly from where logs are stored (e.g., file system, database table - use Prisma for DB approach).
    *   Set up basic log rotation/retention policies if storing logs locally (e.g., in files or a database table).

*   **Example Enhanced Logging Query API Route:**
    ```typescript
    // pages/api/logs/query.ts (or app/api/logs/query/route.ts)
    import { NextApiRequest, NextApiResponse } from 'next';
    import { getServerSession } from 'next-auth/next';
    import { authOptions } from '@/pages/api/auth/[...nextauth]';
    import { LogQueryDto, LogResponseDto } from '@/dto/logging.dto'; // Define DTOs for query/response
    import { queryLogs } from '@/services/logQueryService'; // Service to handle actual log querying
    import { RoleType } from '@prisma/client';
    import { ForbiddenError, UnauthorizedError } from '@/utils/errors';
    import { validateDto } from '@/utils/validation'; // DTO validation helper

    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method !== 'GET') {
            res.setHeader('Allow', 'GET');
            return res.status(405).end('Method Not Allowed');
        }

        const session = await getServerSession(req, res, authOptions);

        if (!session?.user?.id || !session.user.role) {
             return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
        }

        // Basic RBAC check
        const allowedRoles = [RoleType.GOD_MODE, RoleType.ORG_OWNER, RoleType.ORG_ADMIN];
        if (!allowedRoles.includes(session.user.role as RoleType)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions to view logs.' });
        }

        try {
            // Validate query parameters against DTO
            const queryParams = await validateDto(LogQueryDto, req.query);

            // Enforce organization filter for non-GOD_MODE users
            if (session.user.role !== RoleType.GOD_MODE) {
                if (!session.user.organizationId) {
                    throw new ForbiddenError('User must belong to an organization to view logs.');
                }
                // Ensure query targets only the user's organization
                if (queryParams.organizationId && queryParams.organizationId !== session.user.organizationId) {
                     throw new ForbiddenError('Cannot query logs for other organizations.');
                }
                queryParams.organizationId = session.user.organizationId;
            }

            // Call the service function to fetch logs based on validated query params
            const logsResult: LogResponseDto = await queryLogs(queryParams);

            res.status(200).json(logsResult);

        } catch (error: any) {
            // Handle validation errors or service errors
            if (error instanceof ForbiddenError || error instanceof UnauthorizedError) {
                return res.status(error.statusCode).json({ message: error.message });
            }
            if (error.name === 'ValidationError') { // Example validation error handling
                 return res.status(400).json({ message: 'Invalid query parameters', errors: error.errors });
            }
            // Log internal errors
            console.error("Error fetching logs:", error); // Replace with proper logging
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ```

*   **Alerting & Monitoring Integration**
    *   If using an external logging platform, configure alerts based on log patterns (e.g., high error rates, specific security events like failed logins, permission failures).
    *   If logging locally, consider adding a mechanism (e.g., scheduled job) to monitor logs and trigger alerts (e.g., send email via SendGrid) on critical conditions.

#### Task Group 2: Advanced Security & Finalization

*   **Security Hardening**
    *   Perform thorough security review of all API routes and GraphQL resolvers/mutations
    *   Implement robust input validation (`zod`) on all incoming data
    *   Ensure proper output encoding to prevent XSS vulnerabilities (Next.js handles much of this for React components)
    *   Review dependencies for known vulnerabilities (`npm audit fix` or similar tools)
    *   Configure strict Content Security Policy (CSP) headers
    *   Ensure NextAuth.js CSRF protection is active and properly configured
    *   Implement measures against GraphQL-specific attacks (depth limiting, query complexity analysis, disable introspection in production) if using GraphQL

*   **Performance Optimization**
    *   Analyze database query performance using tools like Prisma Studio or query logging; add indexes where needed
    *   Optimize API route/GraphQL resolver performance; implement caching where appropriate (e.g., Next.js Data Cache, ISR, or external Redis cache)
    *   Optimize frontend bundle size and loading performance using Next.js features (dynamic imports, code splitting)

*   **Final Documentation & Code Cleanup**
    *   Ensure all code is well-commented and follows established standards
    *   Complete `README.md` with setup, development, deployment instructions
    *   Generate final API documentation (GraphQL schema, OpenAPI spec if applicable)
    *   Remove unused code, dependencies, and console logs
    *   Finalize environment variable configuration (`.env.example`, `.env.production`)

*   **Final Testing**
    *   Execute full suite of unit, integration, and E2E tests
    *   Perform manual QA testing across different user roles and scenarios
    *   Conduct final security penetration testing (internal or external)

## Key Milestones & Deliverables

Deliverables remain similar conceptually but reflect the Next.js/Prisma/NextAuth stack.

*   **Phase 1 Deliverables**: Initialized Next.js project, Prisma schema & migrations, basic GraphQL/API routes, NextAuth.js core setup (Credentials/Google), basic CRUD, logging route, initial tests.
*   **Phase 2 Deliverables**: RBAC permission system, `hasPermission` utility, client-side permission handling, NextAuth.js refinements (password reset, email verify), comprehensive auth/authz tests.
*   **Phase 3 Deliverables**: Admin API routes/GraphQL endpoints, application catalog management, organization-app assignment system, admin role enforcement tests.
*   **Phase 4 Deliverables**: Stripe integration (customer/subscription creation), Stripe webhook handler API route, subscription lifecycle management logic, end-to-end payment/subscription tests.
*   **Phase 5 Deliverables**: Enhanced logging query API route, security hardening features (CSP, rate limiting refined), performance optimizations, final documentation, full test suite passing, deployment-ready application.

## Testing Strategy

*   **Unit Testing**: Use Jest or Vitest to test individual functions, utilities, service logic, React components in isolation. Mock dependencies like Prisma Client, NextAuth.js session, external APIs.
*   **Integration Testing**: Test interactions between components, such as API routes calling service logic and interacting with a test database (using Prisma). Test NextAuth.js flows with mocking. Test GraphQL resolvers.
*   **End-to-End Testing**: Use Playwright or Cypress to simulate user interactions in a browser, covering critical user flows like registration, login, core feature usage, subscription purchase, and admin tasks. Test against a staging environment.
*   **Security Testing**: Automated vulnerability scanning (e.g., `npm audit`), dependency checks. Manual penetration testing focusing on authentication, authorization, input validation, and common web vulnerabilities (OWASP Top 10).

## Deployment Considerations

*   **Environment Configuration**: Manage environment variables securely for different stages (development, staging, production) using `.env` files and platform-specific environment variable management (e.g., Vercel, Netlify, AWS Secrets Manager, Docker secrets).
*   **CI/CD Pipeline**: Set up automated pipeline (e.g., GitHub Actions, GitLab CI, Vercel Deployments) to lint, test, build, and deploy the Next.js application on every push to main/production branches. Include `prisma migrate deploy` step for database migrations.
*   **Monitoring & Maintenance**: Implement application performance monitoring (APM) (e.g., Vercel Analytics, Sentry, Datadog). Set up infrastructure monitoring if self-hosting. Regularly update dependencies and apply security patches. Monitor logs for errors and unusual activity.

## Implementation Details for Role/Permission-Based UI Control

*   **Server-Side Implementation**:
    *   API Routes/GraphQL Resolvers: Use NextAuth.js (`getServerSession`) to identify the user and their role/organization.
    *   Permission Logic: Call the `hasPermission` utility function within resolvers or middleware to check access rights before processing requests or returning data.
    *   Data Filtering: Filter data based on user's organization and permissions (e.g., non-admins only see their org's data).
    *   GraphQL (if used): Use schema directives or resolver logic to enforce permissions. Optionally pass permission requirements via extensions for client use.
*   **Client-Side Implementation**:
    *   Session Data: Use NextAuth.js `useSession` hook to access user session info.
    *   Permission Fetching: Fetch detailed user permissions on login/session load via a dedicated endpoint and store them in React Context or state management.
    *   Conditional Rendering: Use a `PermissionGuard` component or `useHasPermission` hook (checking against stored permissions) to conditionally render UI elements (buttons, menu items, data fields).
    *   UI State: Disable or hide elements that the user does not have permission to interact with, providing clear visual cues.

## Risk Management

*   **Technical Risks**:
    *   Complexity of managing a full-stack application within Next.js.
    *   Scalability challenges with integrated API logging routes under high load (mitigation: offload to dedicated service if needed).
    *   Potential issues integrating GraphQL seamlessly with Next.js App Router server components/actions (if used heavily).
    *   Vendor lock-in with specific platforms (e.g., Vercel).
    *   Security vulnerabilities in custom RBAC logic or integration points.
    *   Prisma migration conflicts in team environments.
*   **Mitigation Strategies**:
    *   Adopt clear code structure and modular design.
    *   Monitor logging performance and have a plan to scale/offload if necessary.
    *   Thorough testing of GraphQL integrations.
    *   Design for platform abstraction where feasible.
    *   Conduct rigorous security reviews and testing.
    *   Establish clear branching and migration strategies for Prisma.
    *   Regular team communication and code reviews.

## Conclusion

This revised plan leverages the flexibility and integrated nature of Next.js, Prisma, and NextAuth.js to build a modern, secure, and scalable application. By consolidating the stack and using popular, well-supported libraries, we aim for faster development, easier maintenance, and a robust system for managing users, organizations, applications, and subscriptions with fine-grained access control. The phased approach allows for iterative development and testing, ensuring quality and alignment with requirements throughout the project lifecycle.
