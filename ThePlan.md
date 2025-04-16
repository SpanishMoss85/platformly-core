# Project Overview

This development plan outlines the implementation of a secure, scalable GraphQL API backend using Node.js and NestJS. The system will manage users, organizations, applications, and subscriptions with robust authentication, role-based access control, and third-party integrations.

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
        *   [Task Group 1: Centralized Logging Enhancements](#task-group-1-centralized-logging-enhancements)
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

*   **Backend Framework**: NestJS with TypeScript
*   **API Layer**: GraphQL with Apollo Server
*   **Database**: PostgreSQL with TypeORM
*   **Authentication**: JWT, Email/Password, Google OAuth
*   **Authorization**: Role-Based Access Control (RBAC)
*   **Integrations**: Stripe, SendGrid
*   **Logging**: Centralized logging service with API endpoints
*   **Testing**: Jest for unit and integration tests
*   **Frontend Styling**: TailwindCSS (to be implemented in frontend phase)

## Development Plan

### Phase 1: Foundation & Core Entities

#### Task Group 1: Project Setup & Database Configuration

*   **Initialize NestJS project with TypeScript configuration**
    *   Set up project structure following NestJS best practices
    *   Configure TypeScript with strict type checking
    *   Establish linting rules and code formatting standards

*   **Database & ORM Configuration**
    *   Set up PostgreSQL connection using TypeORM
    *   Define TypeORM entities with proper relationships:
        *   `User` (with role and organization relations)
        *   `Role` (enum-based)
        *   `Organization` (with owner relation)
        *   `Application` (with enabled flag)
        *   `OrganizationApplication` (join entity)
        *   `Subscription` (with organization relation)
    *   Generate and test initial database migrations
    *   Implement database seeding module for roles and admin user

*   **GraphQL Schema Foundation**
    *   Set up Apollo Server with NestJS
    *   Define initial GraphQL types matching entity structure
    *   Configure GraphQL playground for development

*   **Centralized Logging Service**
    *   Create logging microservice with API endpoints
    *   Implement structured JSON logging with severity levels
    *   Design logging schema with environment, context, and user information
    *   Set up log rotation and retention policies in centralized storage
    *   Create client module for application components to use

*   **Example Logging Service Client:**
    ```typescript
    // logging.service.ts
    import { Injectable } from '@nestjs/common';
    import { HttpService } from '@nestjs/axios';
    import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class LoggingService {
      constructor(
        private httpService: HttpService,
        private configService: ConfigService
      ) {}

      private async sendLog(level: string, message: string, metadata: any = {}) {
        const logPayload = {
          timestamp: new Date().toISOString(),
          level,
          message,
          service: this.configService.get('SERVICE_NAME', 'api-backend'),
          environment: this.configService.get('NODE_ENV', 'development'),
          ...metadata
        };

        try {
          await this.httpService.post(
            this.configService.get('LOGGING_API_URL') + '/logs',
            logPayload,
            {
              headers: {
                'X-API-Key': this.configService.get('LOGGING_API_KEY')
              }
            }
          ).toPromise();
        } catch (error) {
          // Fallback to console in case the logging service is unavailable
          console.error('Failed to send log:', error.message);
          console.log(logPayload);
        }
      }

      log(message: string, context?: string, userId?: string) {
        this.sendLog('info', message, { context, userId });
      }

      error(message: string, trace?: string, context?: string, userId?: string) {
        this.sendLog('error', message, { trace, context, userId });
      }

      warn(message: string, context?: string, userId?: string) {
        this.sendLog('warn', message, { context, userId });
      }

      // Audit logging for security and system events
      audit(action: string, details: any, userId?: string, targetEntity?: string, targetId?: string) {
        this.sendLog('audit', action, { userId, targetEntity, targetId, details });
      }
    }
    ```

#### Task Group 2: Core Authentication & Basic CRUD

*   **Authentication Implementation**
    *   Implement secure password hashing with `bcrypt`
    *   Create registration and login resolvers with JWT generation
    *   Set up `SendGrid` integration for email verification
    *   Configure secure `HttpOnly` cookie storage for JWT
    *   Implement basic auth guards for GraphQL resolvers

*   **Basic CRUD Operations**
    *   Implement `User` queries and mutations
    *   Implement `Organization` queries and mutations
    *   Implement `Application` queries and mutations
    *   Add input validation with `class-validator`

*   **Launch Authorization Logic**
    *   Implement `getAuthorizedLaunchUrl` mutation
    *   Create logic for checking subscription status
    *   Validate application assignments and enablement
    *   Return appropriate URL or error messages

*   **Example `getAuthorizedLaunchUrl` Service Method:**
    ```typescript
    // app-launch.service.ts
    import { Injectable, UnauthorizedException } from '@nestjs/common';
    import { Repository, In } from 'typeorm';
    import { OrganizationApplication } from './entities/organization-application.entity';
    import { Subscription } from './entities/subscription.entity';
    import { Application } from './entities/application.entity';
    import { User } from './entities/user.entity'; // Assuming User entity import

    @Injectable()
    export class AppLaunchService {
      constructor(
        // Assuming User repository is injected
        private userRepo: Repository<User>,
        private orgAppRepo: Repository<OrganizationApplication>,
        private subscriptionRepo: Repository<Subscription>,
        private applicationRepo: Repository<Application>
      ) {}

      async getAuthorizedLaunchUrl(userId: string, appId: string): Promise<string> {
        // Get user with organization
        const user = await this.userRepo.findOne({
          where: { id: userId },
          relations: ['organization']
        });

        if (!user || !user.organization) {
          throw new UnauthorizedException('User is not associated with an organization');
        }

        const orgId = user.organization.id;

        // Check if app is assigned to organization
        const orgApp = await this.orgAppRepo.findOne({
          where: { organization: { id: orgId }, application: { id: appId } } // Adjusted based on likely entity structure
        });

        if (!orgApp) {
          throw new UnauthorizedException('Application is not assigned to this organization');
        }

        // Check if app is enabled
        const app = await this.applicationRepo.findOne({
          where: { id: appId }
        });

        if (!app || !app.isEnabled) {
          throw new UnauthorizedException('Application is not available');
        }

        // Check subscription status
        const subscription = await this.subscriptionRepo.findOne({
          where: {
            organization: { id: orgId },
            status: In(['active', 'trial']) // Assuming 'trial' is a valid status
          }
        });

        if (!subscription) {
          throw new UnauthorizedException('Organization does not have an active subscription');
        }

        // All checks passed, return the launch URL
        // Assuming launchUrl is a property of the Application entity
        if (!app.launchUrl) {
           throw new UnauthorizedException('Application launch URL is not configured');
        }
        return app.launchUrl;
      }
    }
    ```

*   **Security Foundations**
    *   Implement `Helmet` for HTTP security headers
    *   Configure secure `CORS` settings
    *   Set up basic rate limiting

*   **Testing & Documentation**
    *   Set up `Jest` testing framework
    *   Write unit tests for authentication flows
    *   Create integration tests for CRUD operations
    *   Document API endpoints and authentication flow
    *   Prepare `README.md` and `.env.example` files

### Phase 2: RBAC & Enhanced Authentication

#### Task Group 1: Role-Based Access Control and Permissions

*   **Feature Flag & Permissions System**
    *   Design a flexible permissions system with feature flags
    *   Implement dynamic permissions based on user roles, subscription levels, and context
    *   Create a centralized permission service for checking access rights
    *   Set up database schema for storing feature flags and permissions

*   **Example Permission Service:**
    ```typescript
    // permission.service.ts
    import { Injectable } from '@nestjs/common';
    import { Repository, In } from 'typeorm';
    import { User } from './entities/user.entity';
    import { Organization } from './entities/organization.entity';
    import { Subscription } from './entities/subscription.entity';
    import { FeatureFlag } from './entities/feature-flag.entity'; // Assuming FeatureFlag entity
    import { RoleType } from './enums/role-type.enum'; // Assuming RoleType enum

    @Injectable()
    export class PermissionService {
      constructor(
        private userRepo: Repository<User>,
        private orgRepo: Repository<Organization>,
        private subscriptionRepo: Repository<Subscription>,
        private featureFlagRepo: Repository<FeatureFlag>
      ) {}

      // Check if user has access to a specific feature
      async hasFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
        // Get user with role and organization
        const user = await this.userRepo.findOne({
          where: { id: userId },
          relations: ['role', 'organization'] // Assuming 'role' relation exists
        });

        if (!user) return false;

        // Assuming user.role is an object with a 'name' property holding RoleType
        if (!user.role || !user.role.name) return false;

        // Check role-based permissions first (highest priority)
        if (this.hasRolePermission(user.role.name, featureKey)) {
          return true;
        }

        // If no organization, no further checks needed
        if (!user.organization) return false;

        // Check organization-level feature flags
        const orgFeatureFlag = await this.featureFlagRepo.findOne({
          where: {
            organizationId: user.organization.id, // Assuming direct ID reference
            featureKey
          }
        });

        if (orgFeatureFlag?.enabled) return true;

        // Check subscription-level permissions
        const subscription = await this.subscriptionRepo.findOne({
          where: {
            organization: { id: user.organization.id },
            status: In(['active', 'trial'])
          },
          relations: ['plan'] // Assuming 'plan' relation exists on Subscription
        });

        if (!subscription || !subscription.plan) return false;

        // Assuming plan has an 'includedFeatures' array of strings
        return subscription.plan.includedFeatures?.includes(featureKey) || false;
      }

      // Check if user can access/view a specific application
      async canAccessApplication(userId: string, appId: string): Promise<boolean> {
        // Implementation logic needs to be defined based on how app access is determined
        // Example: Check if the feature 'app:<appId>' is granted
        return await this.hasFeatureAccess(userId, `app:${appId}`);
      }

      // Helper method to determine if a role has a specific permission
      private hasRolePermission(role: RoleType, featureKey: string): boolean {
        // Role permission mappings
        const rolePermissions: Record<RoleType, string[]> = {
          [RoleType.GOD_MODE]: ['*'], // All features
          [RoleType.ORG_OWNER]: ['billing:*', 'user:*', 'app:*'],
          [RoleType.ORG_ADMIN]: ['user:*', 'app:*'],
          [RoleType.ADMIN]: ['app:*'],
          [RoleType.POWER_USER]: ['app:basic'],
          [RoleType.USER]: ['app:basic'],
          [RoleType.GUEST]: []
        };

        const permissions = rolePermissions[role] || [];

        // Check for wildcard permissions
        if (permissions.includes('*')) return true;

        // Check for category wildcards (e.g., 'billing:*')
        const category = featureKey.split(':')[0];
        if (permissions.includes(`${category}:*`)) return true;

        // Check for exact permission match
        return permissions.includes(featureKey);
      }
    }
    ```

*   **UI Visibility Control with Directives**
    *   Implement GraphQL directive for permission-based field visibility
    *   Create directive resolver for client-side permission checking
    *   Design permission-aware GraphQL schema with authorization metadata
    *   Set up client-side visibility control with directive data

*   **Example GraphQL Directive:**
    ```typescript
    // permission.directive.ts
    import { SchemaDirectiveVisitor } from 'apollo-server-express'; // Or your Apollo Server integration
    import { defaultFieldResolver, GraphQLField } from 'graphql';
    import { ForbiddenException } from '@nestjs/common';
    import { PermissionService } from './permission.service'; // Adjust path

    // Directive definition in your schema (e.g., schema.gql)
    // directive @requirePermission(feature: String!) on FIELD_DEFINITION

    // Note: SchemaDirectiveVisitor is often used with older Apollo Server versions.
    // Newer versions might use different approaches like schema transforms or middleware.
    // This example assumes SchemaDirectiveVisitor usage.
    export class RequirePermissionDirective extends SchemaDirectiveVisitor {
      visitFieldDefinition(field: GraphQLField<any, any>) {
        const { resolve = defaultFieldResolver } = field;
        const { feature } = this.args;

        field.resolve = async function(...args) {
          const [source, resolverArgs, context, info] = args;

          // Assuming context is set up correctly with user info and DI container
          if (!context.user || !context.user.id || !context.container) {
             throw new ForbiddenException('Authentication required or context misconfigured');
          }
          const userId = context.user.id;
          const permissionService = context.container.get(PermissionService);

          // Check if user has required permission
          const hasPermission = await permissionService.hasFeatureAccess(
            userId,
            feature
          );

          // If no permission, return null or throw error based on configuration
          // Assuming a context property 'permissionStrategy' exists, otherwise default logic
          const strategy = context.permissionStrategy || 'NULL'; // Default to NULL
          if (!hasPermission) {
            if (strategy === 'NULL') {
              return null;
            } else { // Assuming 'ERROR' strategy
              throw new ForbiddenException(`Missing permission: ${feature}`);
            }
          }

          // User has permission, resolve normally
          return resolve.apply(this, args);
        };

        // Add metadata for client visibility control (optional, depends on client needs)
        // Ensure extensions object exists
        if (!field.extensions) {
             field.extensions = {};
        }
        field.extensions.requiresPermission = feature;
      }
    }
    ```

*   **Example UI Permission Schema:**
    ```graphql
    # app.schema.graphql

    # Assume directive is defined elsewhere
    # directive @requirePermission(feature: String!) on FIELD_DEFINITION

    type Application {
      id: ID!
      name: String!
      description: String!
      launchUrl: String!
      # Admin-only field
      isEnabled: Boolean! @requirePermission(feature: "app:admin")
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
        # Example field
        planId: ID!
    }

    type Subscription {
        id: ID!
        # other fields...
    }
    ```

*   **Client-Side Permission Integration**
    *   Design Apollo Client plugin for permission-based UI rendering
    *   Create higher-order components for permission-based visibility
    *   Implement reactive permission checking
    *   Set up permission caching and invalidation

*   **Example React Permission Component:**
    ```typescript
    // PermissionGuard.tsx
    import React from 'react';
    import { useQuery, gql } from '@apollo/client'; // Assuming Apollo Client
    // Define your query appropriately
    const CHECK_PERMISSION_QUERY = gql`
      query CheckPermission($feature: String!) {
        # This query needs a corresponding resolver on the backend
        # that checks the permission for the current user.
        # Or, fetch all user permissions once and check locally.
        hasPermission(feature: $feature)
      }
    `;

    // Example Spinner component
    const Spinner: React.FC<{size: string}> = ({size}) => <div>Loading...</div>;

    interface PermissionGuardProps {
      feature: string;
      fallback?: React.ReactNode;
      children: React.ReactNode;
    }

    export const PermissionGuard: React.FC<PermissionGuardProps> = ({
      feature,
      fallback = null,
      children
    }) => {
      // This approach makes a query per guard. Fetching all permissions once
      // and using a context provider is usually more efficient.
      const { loading, error, data } = useQuery(CHECK_PERMISSION_QUERY, {
        variables: { feature }
      });

      if (loading) return <Spinner size="sm" />;
      // Consider more specific error handling
      if (error) return fallback;

      return data?.hasPermission ? <>{children}</> : <>{fallback}</>;
    };

    // Example Usage:
    // Assuming UpdateSubscriptionButton is defined elsewhere
    // const UpdateSubscriptionButton = () => <button>Update Subscription</button>;

    // <PermissionGuard feature="billing:manage">
    //   <UpdateSubscriptionButton />
    // </PermissionGuard>
    ```

*   **Complete RBAC System**
    *   Define role hierarchy and permissions matrix
    *   Implement custom RBAC decorators and guards
    *   Create role management resolvers (assign/revoke)
    *   Apply appropriate guards to all existing resolvers

*   **Example Enhanced RBAC Guard:**
    ```typescript
    // roles.guard.ts
    import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
    import { Reflector } from '@nestjs/core';
    import { GqlExecutionContext } from '@nestjs/graphql';
    import { PermissionService } from './permission.service'; // Adjust path
    import { RoleType } from './enums/role-type.enum'; // Adjust path

    @Injectable()
    export class RolesGuard implements CanActivate {
      constructor(
        private reflector: Reflector,
        private permissionService: PermissionService
      ) {}

      async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>('roles', [
          context.getHandler(),
          context.getClass(),
        ]);

        const requiredFeatures = this.reflector.getAllAndOverride<string[]>('features', [
          context.getHandler(),
          context.getClass(),
        ]);

        // If no restrictions, allow access
        if (!requiredRoles && !requiredFeatures) {
          return true;
        }

        const gqlContext = GqlExecutionContext.create(context);
        const ctx = gqlContext.getContext();
        // Assuming user is attached to the request/context object
        const user = ctx.req?.user || ctx.user;

        if (!user || !user.id || !user.role?.name) {
          return false; // No user or missing required user properties
        }

        // Check if user's role meets requirements
        if (requiredRoles && !this.checkRoleHierarchy(user.role.name, requiredRoles)) {
          return false;
        }

        // Check feature permissions
        if (requiredFeatures) {
          for (const feature of requiredFeatures) {
            const hasAccess = await this.permissionService.hasFeatureAccess(
              user.id,
              feature
            );
            if (!hasAccess) return false;
          }
        }

        return true;
      }

      private checkRoleHierarchy(userRole: RoleType, requiredRoles: RoleType[]): boolean {
        // Role hierarchy from highest to lowest permission level
        const roleHierarchy = [
          RoleType.GOD_MODE,
          RoleType.ORG_OWNER,
          RoleType.ORG_ADMIN,
          RoleType.ADMIN,
          RoleType.POWER_USER,
          RoleType.USER,
          RoleType.GUEST
        ];

        const userRoleIndex = roleHierarchy.indexOf(userRole);
        if (userRoleIndex === -1) return false; // User role not found in hierarchy

        // Check if user's role has sufficient permissions (lower index means higher permission)
        return requiredRoles.some(requiredRole => {
          const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
          return requiredRoleIndex !== -1 && userRoleIndex <= requiredRoleIndex;
        });
      }
    }
    ```

*   **Example Combined Decorators:**
    ```typescript
    // access-control.decorators.ts
    import { SetMetadata } from '@nestjs/common';
    import { RoleType } from './enums/role-type.enum'; // Adjust path

    export const ROLES_KEY = 'roles';
    export const FEATURES_KEY = 'features';

    export const RequireRoles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
    export const RequireFeatures = (...features: string[]) => SetMetadata(FEATURES_KEY, features);

    // Usage in resolver (assuming @UseGuards(RolesGuard) is applied at class or app level):
    // import { Mutation, Args, Resolver } from '@nestjs/graphql';
    // import { UseGuards } from '@nestjs/common';
    // import { RolesGuard } from './roles.guard'; // Adjust path
    // import { RequireRoles, RequireFeatures } from './access-control.decorators';
    // import { RoleType } from './enums/role-type.enum'; // Adjust path

    // @Resolver()
    // @UseGuards(RolesGuard) // Apply the guard
    // export class SomeResolver {
    //   @Mutation(() => Boolean) // Use appropriate return type from GraphQL schema
    //   @RequireRoles(RoleType.ORG_ADMIN, RoleType.ORG_OWNER)
    //   @RequireFeatures('user:manage')
    //   async assignUserToOrganization(
    //     @Args('userId') userId: string,
    //     @Args('organizationId') organizationId: string
    //   ): Promise<boolean> {
    //     // Implementation...
    //     console.log(`Assigning user ${userId} to org ${organizationId}`);
    //     return true; // Placeholder
    //   }
    // }
    ```

*   **Resource Access Control**
    *   Implement organization membership validation
    *   Add ownership checks for organization resources
    *   Create organization user management functionality
    *   Test access control with different user scenarios

#### Task Group 2: Authentication Enhancements

*   **OAuth Integration**
    *   Implement Google OAuth 2.0 authentication
    *   Create user account linking (OAuth to existing accounts)
    *   Add social login resolvers and handlers
    *   Test OAuth flows with mock providers

*   **Authentication Refinements**
    *   Implement password reset functionality
    *   Add email verification workflows
    *   Create session management capabilities
    *   Implement multi-device logout functionality

*   **Testing & Validation**
    *   Write comprehensive RBAC unit tests
    *   Create OAuth integration tests
    *   Test session management and security features
    *   Validate authorization across different user roles

### Phase 3: Admin Features & Application Management

#### Task Group 1: Admin Functionality

*   **`GodMode` and Admin Capabilities**
    *   Implement user management with role assignment
    *   Create organization management functionality
    *   Add system-wide settings and configurations
    *   Implement administrative queries and reporting

*   **Application Catalog Management**
    *   Create application CRUD operations for admins
    *   Implement application status management
    *   Add application metadata and configuration options
    *   Create batch operations for applications

#### Task Group 2: Organization-Application Management

*   **Application Assignment System**
    *   Implement organization-application assignments
    *   Create bulk assignment capabilities
    *   Add assignment history and tracking
    *   Implement assignment validation rules

*   **Admin Interface Enhancements**
    *   Organize GraphQL schema for admin operations
    *   Create admin-specific query/mutation groups
    *   Enhance GraphQL playground with documentation
    *   Add examples for common admin operations

*   **Testing & Validation**
    *   Write unit tests for admin functionality
    *   Create integration tests for application management
    *   Test organization-application assignments
    *   Validate admin-only access controls

### Phase 4: Stripe Integration & Subscription Management

#### Task Group 1: Stripe Core Integration

*   **Stripe Setup**
    *   Integrate `stripe-node` library
    *   Set up Stripe customer creation and management
    *   Link organizations to Stripe customers
    *   Implement Stripe API error handling

*   **Example Stripe Service:**
    ```typescript
    // stripe.service.ts
    import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
    import { ConfigService } from '@nestjs/config';
    import { InjectRepository } from '@nestjs/typeorm';
    import { Repository } from 'typeorm';
    import Stripe from 'stripe';
    import { Organization } from './entities/organization.entity'; // Adjust path
    import { Subscription } from './entities/subscription.entity'; // Adjust path
    import { LoggingService } from './logging.service'; // Adjust path

    @Injectable()
    export class StripeService {
      private stripe: Stripe;

      constructor(
        private configService: ConfigService,
        @InjectRepository(Organization)
        private organizationRepo: Repository<Organization>,
        @InjectRepository(Subscription)
        private subscriptionRepo: Repository<Subscription>,
        private loggingService: LoggingService
      ) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
          apiVersion: '2023-10-16', // Use your target Stripe API version
        });
      }

      async createStripeCustomer(organizationId: string): Promise<string> {
        try {
          const organization = await this.organizationRepo.findOne({
            where: { id: organizationId },
            relations: ['owner'] // Assuming 'owner' relation with user email exists
          });

          if (!organization) {
            throw new NotFoundException(`Organization not found with ID: ${organizationId}`);
          }
          if (!organization.owner || !organization.owner.email) {
            throw new BadRequestException(`Organization owner or owner email not found for Org ID: ${organizationId}`);
          }

          // Create a Stripe customer
          const customer = await this.stripe.customers.create({
            name: organization.name,
            email: organization.owner.email,
            metadata: {
              organizationId: organization.id
            }
          });

          // Update organization with Stripe customer ID
          await this.organizationRepo.update(
            { id: organization.id },
            { stripeCustomerId: customer.id }
          );

          this.loggingService.audit(
            'stripe_customer_created',
            { customerId: customer.id },
            organization.owner.id, // Assuming owner has an id
            'organization',
            organization.id
          );

          return customer.id;
        } catch (error) {
          this.handleStripeError(error);
        }
      }

      async createSubscription(
        organizationId: string,
        priceId: string,
        paymentMethodId: string
      ): Promise<Subscription> { // Return local Subscription entity
        try {
          const organization = await this.organizationRepo.findOne({
            where: { id: organizationId }
          });

          if (!organization) {
             throw new NotFoundException(`Organization not found with ID: ${organizationId}`);
          }
          if (!organization.stripeCustomerId) {
            throw new BadRequestException('Organization has no Stripe customer ID. Please create one first.');
          }

          // Attach payment method to customer
          await this.stripe.paymentMethods.attach(paymentMethodId, {
            customer: organization.stripeCustomerId
          });

          // Set as default payment method
          await this.stripe.customers.update(organization.stripeCustomerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId
            }
          });

          // Create subscription
          const stripeSubscription = await this.stripe.subscriptions.create({
            customer: organization.stripeCustomerId,
            items: [{ price: priceId }],
            expand: ['latest_invoice.payment_intent'] // Important for checking payment status later
          });

          // Create local subscription record
          const subscription = this.subscriptionRepo.create({
            organization,
            stripeSubscriptionId: stripeSubscription.id,
            stripePriceId: priceId,
            status: stripeSubscription.status, // e.g., 'active', 'incomplete'
            planType: 'recurring', // Determine based on price or needs
            startDate: new Date(stripeSubscription.current_period_start * 1000),
            endDate: new Date(stripeSubscription.current_period_end * 1000),
            // Add other relevant fields like plan details if needed
          });

          const savedSubscription = await this.subscriptionRepo.save(subscription);

          // Optionally update org's active subscription reference
          // Be careful if an org can have multiple subscriptions
          await this.organizationRepo.update(
            { id: organizationId },
            { activeSubscription: savedSubscription } // Assuming 'activeSubscription' relation exists
          );

          this.loggingService.audit(
            'subscription_created',
            {
              subscriptionId: savedSubscription.id,
              stripeSubscriptionId: stripeSubscription.id,
              status: stripeSubscription.status
            },
            'system', // Or user ID if initiated by a user action
            'organization',
            organizationId
          );

          return savedSubscription;
        } catch (error) {
          this.handleStripeError(error);
        }
      }

      private handleStripeError(error: any): never {
        this.loggingService.error('Stripe API Error', error.message, 'StripeService');
        if (error instanceof Stripe.errors.StripeError) {
          switch (error.type) {
            case 'StripeCardError':
              // A declined card error
              throw new BadRequestException(`Payment failed: ${error.message}`);
            case 'StripeRateLimitError':
              // Too many requests made to the API too quickly
              throw new InternalServerErrorException('Stripe rate limit exceeded. Please try again later.');
            case 'StripeInvalidRequestError':
              // Invalid parameters were supplied to Stripe's API
              throw new BadRequestException(`Invalid request to Stripe: ${error.message}`);
            case 'StripeAPIError':
              // An error occurred internally with Stripe's API
              throw new InternalServerErrorException('Stripe API internal error. Please try again later.');
            case 'StripeConnectionError':
              // Some kind of error occurred during the HTTPS communication
              throw new InternalServerErrorException('Stripe connection error. Please check network and try again.');
            case 'StripeAuthenticationError':
              // You probably used an incorrect API key
              throw new InternalServerErrorException('Stripe authentication error. Check API keys.');
            default:
              // Handle any other types of unexpected errors
              throw new InternalServerErrorException('An unexpected payment processing error occurred.');
          }
        }
        // Re-throw non-Stripe errors
        throw error;
      }
    }
    ```

*   **Subscription Management**
    *   Create subscription creation resolvers
    *   Implement recurring subscription handling
    *   Add free trial subscription capabilities
    *   Create one-time payment functionality

#### Task Group 2: Subscription Lifecycle & Webhooks

*   **Webhook Implementation**
    *   Create secure Stripe webhook endpoints
    *   Implement event handlers for subscription events (`customer.subscription.updated`, `invoice.payment_succeeded`, etc.)
    *   Add payment success/failure handling
    *   Create subscription status update logic

*   **Example Stripe Webhook Controller:**
    ```typescript
    // stripe-webhook.controller.ts
    import { Controller, Post, Req, Headers, BadRequestException, HttpCode, RawBodyRequest } from '@nestjs/common';
    import { ConfigService } from '@nestjs/config';
    import Stripe from 'stripe';
    import { Request } from 'express'; // Use express Request type if using express adapter
    import { SubscriptionService } from './subscription.service'; // Your service to handle subscription logic
    import { LoggingService } from './logging.service'; // Your logging service

    @Controller('webhooks/stripe')
    export class StripeWebhookController {
      private stripe: Stripe;

      constructor(
        private configService: ConfigService,
        private subscriptionService: SubscriptionService, // Inject your service
        private loggingService: LoggingService
      ) {
         this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16', // Match your Stripe API version
         });
      }

      // Ensure raw body parsing is enabled in main.ts: app.useBodyParser('json', { verify: ... });
      // Or use `@Body(new RawBodyParser())` if you have a custom parser pipe.
      // NestJS v8+ recommends using `app.use(json({ verify: ... }))` in main.ts.
      // For this example, we assume rawBody is available on the request object.
      @Post()
      @HttpCode(200) // Stripe expects a 200 OK for successful webhook receipt
      async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: RawBodyRequest<Request> // Use RawBodyRequest if raw body is needed
      ) {
        if (!signature) {
          throw new BadRequestException('Stripe signature header (`stripe-signature`) is missing');
        }

        // Get the raw body buffer if not parsed as JSON
        // This depends on your body parsing setup in main.ts
        const payload = request.rawBody;
        if (!payload) {
            throw new BadRequestException('Webhook request requires raw body payload.');
        }

        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
          // Validate the webhook signature
          event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret
          );

          // Log webhook event received
          this.loggingService.audit(
            'stripe_webhook_received',
            { type: event.type, eventId: event.id },
            'system', // Webhooks are system-initiated
            'webhook',
            event.id
          );

          // Process different webhook events based on event type
          switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
              // These events contain a Stripe Subscription object
              await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
              break;

            case 'customer.subscription.deleted':
              // Event contains a Stripe Subscription object (usually marked as canceled)
              await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
              break;

            case 'invoice.payment_succeeded':
              // Event contains a Stripe Invoice object
              await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
              break;

            case 'invoice.payment_failed':
              // Event contains a Stripe Invoice object
              await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
              break;
             // Add cases for other events you need to handle (e.g., checkout.session.completed)
            default:
              this.loggingService.log(`Unhandled Stripe webhook event type: ${event.type}`, 'StripeWebhookController');
          }

          // Return a 200 response to acknowledge receipt of the event
          return { received: true };

        } catch (err) {
          this.loggingService.error(`Webhook signature verification failed or handler error: ${err.message}`, err.stack, 'StripeWebhookController');
          // Return a 400 error if signature verification fails
          throw new BadRequestException(`Webhook error: ${err.message}`);
        }
      }

      private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        const stripeSubId = subscription.id;
        const status = subscription.status; // e.g., 'active', 'past_due', 'canceled'
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        await this.subscriptionService.updateSubscriptionStatus(stripeSubId, status, currentPeriodEnd);

        this.loggingService.audit(
          'subscription_updated_via_webhook',
          { status, currentPeriodEnd: currentPeriodEnd.toISOString() },
          'system',
          'subscription',
          stripeSubId
        );
      }

      private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
        const stripeSubId = subscription.id;
        // Status might be 'canceled' or another status depending on the cancellation reason/timing
        const status = subscription.status;

        await this.subscriptionService.cancelSubscription(stripeSubId, status);

        this.loggingService.audit(
          'subscription_canceled_via_webhook',
          { status: status },
          'system',
          'subscription',
          stripeSubId
        );
      }

      private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
        // Ensure this invoice relates to a subscription
        if (invoice.subscription && typeof invoice.subscription === 'string') {
           const stripeSubId = invoice.subscription;
           const amountPaid = invoice.amount_paid;
           const invoiceId = invoice.id;

           // Update subscription status, maybe extend period end if relevant
           await this.subscriptionService.updateSubscriptionAfterPayment(
             stripeSubId,
             true, // Payment succeeded
             invoice.period_end // Use invoice period end to update subscription
           );

           this.loggingService.audit(
             'payment_succeeded_webhook',
             { amount: amountPaid, invoiceId: invoiceId },
             'system',
             'subscription',
             stripeSubId
           );
        } else {
            this.loggingService.log(`Payment succeeded webhook for non-subscription invoice: ${invoice.id}`, 'StripeWebhookController');
        }
      }

      private async handlePaymentFailed(invoice: Stripe.Invoice) {
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const stripeSubId = invoice.subscription;
          const attemptCount = invoice.attempt_count;
          const invoiceId = invoice.id;
          const nextPaymentAttempt = invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null;

          // Update subscription status (e.g., to 'past_due') and potentially notify user
          await this.subscriptionService.updateSubscriptionAfterPayment(
            stripeSubId,
            false, // Payment failed
            invoice.period_end // Use invoice period end
          );

          this.loggingService.audit(
            'payment_failed_webhook',
            { attempt: attemptCount, invoiceId: invoiceId, nextAttempt: nextPaymentAttempt?.toISOString() },
            'system',
            'subscription',
            stripeSubId
          );
        } else {
             this.loggingService.log(`Payment failed webhook for non-subscription invoice: ${invoice.id}`, 'StripeWebhookController');
        }
      }
    }
    ```

*   **Subscription Status Management**
    *   Enhance `getAuthorizedLaunchUrl` with subscription validation (check status, expiry)
    *   Implement subscription status checking in relevant services/guards
    *   Add subscription renewal notifications (e.g., upcoming expiry, payment success/failure) via email (`SendGrid`)
    *   Create payment failure handling logic (e.g., retry attempts, grace periods, notifications)

*   **Testing & Validation**
    *   Write unit tests for Stripe service methods and webhook handlers
    *   Create mock Stripe events and use the Stripe CLI for local webhook testing
    *   Test subscription lifecycle scenarios (creation, trial, upgrade, downgrade, cancellation, payment failure)
    *   Validate payment and subscription flows end-to-end in a test environment

### Phase 5: Advanced Security & System Finalization

#### Task Group 1: Centralized Logging Enhancements

*   **Logging Service API Completion**
    *   Enhance the centralized logging API with filtering (by level, timestamp, service, user ID, organization ID) and search capabilities
    *   Implement log aggregation and potentially basic analysis features within the service or integrate with external tools (e.g., ELK stack, Datadog)
    *   Consider creating simple dashboards or views for monitoring key system activity (e.g., errors, audit trails) if not using external tools
    *   Set up alerting based on log patterns (e.g., high error rates, critical security events)

*   **Example Enhanced Logging API Controller:**
    ```typescript
    // logging.controller.ts
    import { Controller, Post, Get, Query, Body, UseGuards, ForbiddenException } from '@nestjs/common';
    import { LogService } from './log.service'; // Your actual log storage/query service
    import { ApiKeyGuard } from './guards/api-key.guard'; // Guard to protect log ingestion endpoint
    import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Standard JWT guard
    import { RolesGuard } from './guards/roles.guard'; // Your RBAC guard
    import { RequireRoles } from './decorators/access-control.decorators'; // Your role decorator
    import { RoleType } from './enums/role-type.enum'; // Your roles enum
    import { CurrentUser } from './decorators/current-user.decorator'; // Decorator to get user from request
    import { User } from './entities/user.entity'; // User entity
    import { CreateLogDto, LogEntryDto, LogQueryDto, LogResponseDto, AuditLogQueryDto, AuditLogResponseDto } from './dto/logging.dto'; // DTOs for logging

    @Controller('api/logs') // Example base path for logging API
    export class LoggingController {
      constructor(
        private logService: LogService, // Service handling log persistence and retrieval
        // AuthService might not be needed here directly unless used for API key validation
        // private authService: AuthService
      ) {}

      // Endpoint for services to push logs
      @Post()
      @UseGuards(ApiKeyGuard) // Protect this endpoint with an API key specific to internal services
      async createLog(@Body() logEntry: CreateLogDto): Promise<LogEntryDto> {
        // Consider adding validation pipe for CreateLogDto
        return this.logService.createLog(logEntry);
      }

      // Endpoint to query general application logs
      @Get()
      @UseGuards(JwtAuthGuard, RolesGuard) // Requires authentication and role check
      @RequireRoles(RoleType.GOD_MODE, RoleType.ORG_OWNER, RoleType.ORG_ADMIN) // Define who can access logs
      async getLogs(
        @Query() query: LogQueryDto, // DTO defining query parameters (level, date range, text search, etc.)
        @CurrentUser() user: User // Get the authenticated user making the request
      ): Promise<LogResponseDto> { // DTO defining the response structure (logs + pagination)
        // Apply organization filter for non-GOD_MODE users to enforce tenancy
        if (user.role.name !== RoleType.GOD_MODE) {
            if (!user.organization || !user.organization.id) {
                throw new ForbiddenException('User must belong to an organization to view logs.');
            }
            // Ensure the query only targets logs belonging to the user's organization
            query.organizationId = user.organization.id;
        }

        // Add validation pipe for LogQueryDto in main.ts or here
        return this.logService.findLogs(query);
      }

      // Endpoint specifically for querying audit logs
      @Get('audit')
      @UseGuards(JwtAuthGuard, RolesGuard)
      @RequireRoles(RoleType.GOD_MODE, RoleType.ORG_OWNER) // Potentially stricter access for audit logs
      async getAuditLogs(
        @Query() query: AuditLogQueryDto, // DTO specific to querying audit logs (action, target, user, etc.)
        @CurrentUser() user: User
      ): Promise<AuditLogResponseDto> { // DTO defining audit log response structure
        // Apply organization filter for non-GOD_MODE users
        if (user.role.name !== RoleType.GOD_MODE) {
            if (!user.organization || !user.organization.id) {
                 throw new ForbiddenException('User must belong to an organization to view audit logs.');
            }
            // Filter audit logs based on the user's organization context
            // This might involve checking targetEntity/targetId or specific metadata
            query.organizationId = user.organization.id; // Assuming audit logs can be linked to an org
        }

        // Add validation pipe for AuditLogQueryDto
        return this.logService.findAuditLogs(query);
      }
    }
    ```

#### Task Group 2: Advanced Security & Finalization

*   **Enhanced Security Measures**
    *   Implement configurable rate limiting (per user, per IP, per endpoint) using libraries like `nestjs-throttler`
    *   Create IP allow/block list functionality (potentially middleware or integrated with WAF)
    *   Add CSRF protection (e.g., using `csurf` middleware) if using cookie-based sessions alongside JWT for certain operations, or ensure GraphQL clients handle CSRF tokens if needed. Often less critical for pure API/SPA setups using header-based auth.
    *   Enhance input validation (`class-validator`, `class-transformer`) and output sanitization where necessary (e.g., preventing XSS in user-generated content if displayed elsewhere)

*   **System Hardening**
    *   Implement security headers comprehensively (using `Helmet` and configuring options like HSTS, CSP, X-Frame-Options)
    *   Add brute force protection for login endpoints (e.g., account lockouts, CAPTCHAs after failures)
    *   Create suspicious activity detection mechanisms (e.g., monitoring rapid changes in user roles, unusual login patterns - potentially tied into logging/alerting)
    *   Implement automated security testing tools (e.g., SAST, DAST scanners) in the CI/CD pipeline

*   **Documentation & Finalization**
    *   Complete API documentation (e.g., using Swagger/OpenAPI for REST parts if any, GraphQL Playground/documentation features, potentially generating static docs)
    *   Finalize `README.md` with comprehensive setup, development, and deployment instructions
    *   Create clear documentation for all required environment variables (`.env.example`)
    *   Add deployment and scaling guidelines (e.g., containerization with Docker, orchestration with Kubernetes, serverless considerations, database scaling)

## Key Milestones & Deliverables

### Phase 1 Deliverables

*   Functional NestJS project with TypeScript configuration.
*   PostgreSQL database schema with defined entities and relationships via TypeORM.
*   Working authentication system (registration, login) with JWT via HttpOnly cookies.
*   Basic CRUD operations (Queries/Mutations) for core entities (`User`, `Organization`, `Application`).
*   Initial `getAuthorizedLaunchUrl` mutation implementation with basic checks.
*   Centralized logging service operational with API endpoints for log ingestion.
*   Core security foundations implemented (`Helmet`, `CORS`, basic rate limiting).
*   Initial suite of unit and integration tests covering base functionality using `Jest`.

### Phase 2 Deliverables

*   Complete Role-Based Access Control (RBAC) system with a flexible permissions/feature flag service.
*   Client-side permission checks and UI visibility controls integrated (using GraphQL directives and frontend components).
*   Google OAuth 2.0 integration for social login and account linking.
*   Enhanced authentication workflows (password reset, email verification).
*   Comprehensive unit and integration tests for RBAC, permissions, and OAuth flows.
*   Validation of resource ownership and access control within organizations.

### Phase 3 Deliverables

*   Admin-specific GraphQL queries and mutations for managing users, organizations, and system settings.
*   Application catalog management system (CRUD for applications by admins).
*   Organization-to-application assignment functionality, including bulk operations.
*   Enhanced GraphQL playground documentation for admin operations.
*   Unit and integration tests covering all admin functionality and application management.

### Phase 4 Deliverables

*   Successful integration with Stripe (`stripe-node`) for customer and payment processing.
*   Subscription management system handling creation, trials, and recurring payments via GraphQL resolvers.
*   Robust Stripe webhook handlers for key subscription lifecycle events (updates, payments, cancellations).
*   Subscription status validation integrated into `getAuthorizedLaunchUrl` and other relevant access points.
*   Comprehensive tests covering Stripe integration, subscription lifecycles, and payment flows.

### Phase 5 Deliverables

*   Enhanced centralized logging service API with filtering, search, and audit trail capabilities.
*   Implementation of audit logging for critical system events and user actions.
*   Advanced security measures in place (configurable rate limiting, IP filtering if needed, CSRF protection if applicable, brute force prevention).
*   Comprehensive API documentation, `README`, environment variable guide, and deployment guidelines finalized.
*   Final system hardening, security testing, and performance tuning completed.

## Testing Strategy

### Unit Testing

*   Individual component tests for GraphQL resolvers, ensuring they delegate correctly to services.
*   Service method validation, including business logic, calculations, and interactions with repositories.
*   Guard and decorator testing to ensure access control logic works as expected.
*   Input validation verification using `class-validator` mocks or instances.
*   Utility function and helper method testing.

### Integration Testing (continued)

*   End-to-end testing of major API flows (e.g., user registration -> login -> fetch data -> update data).
*   Authentication workflow validation, including JWT handling, cookie storage, and OAuth flows.
*   Subscription and payment process testing using Stripe's test mode and mock webhooks.
*   Admin functionality verification across different admin roles.
*   Permission-based access control validation, ensuring users with different roles/permissions see and can do only what they are allowed.
*   Database interaction testing, ensuring data integrity and correct relationships after operations.

### Security Testing

*   Attempting authentication bypass and exploiting known vulnerabilities.
*   Testing authorization logic to ensure users cannot access or modify resources they don't own or have permissions for (horizontal and vertical privilege escalation).
*   Input validation attack testing (SQL injection, XSS - though GraphQL mitigates some SQLi risks, validation is still key).
*   Rate limiting verification under high load conditions.
*   Permission edge case testing (e.g., combinations of roles, feature flags, subscription states).
*   Cross-site request forgery (CSRF) protection verification if applicable (e.g., testing token validation).
*   Dependency vulnerability scanning.

## Deployment Considerations

### Environment Configuration

*   Separate configurations for `development`, `testing`, and `production` environments.
*   Use environment variables (`.env` files managed by NestJS `ConfigModule`) for all sensitive configurations (API keys, database credentials, JWT secrets).
*   Implement a robust secrets management strategy for production (e.g., AWS Secrets Manager, HashiCorp Vault, Doppler).
*   Allow feature flag configuration per environment to enable gradual rollouts or A/B testing.

### CI/CD Pipeline

*   Automated testing (unit, integration, E2E) triggered on every commit/pull request.
*   Automated linting and code quality checks enforce standards.
*   Database migration validation and automated application in staging/production environments.
*   Automated build and deployment process (e.g., Docker image build, push to registry, deployment to Kubernetes/ECS/Cloud Run).
*   Inclusion of security scanning tools (SAST, DAST, dependency checking) within the pipeline.

### Monitoring & Maintenance

*   Implement application performance monitoring (APM) tools (e.g., Datadog, New Relic, Sentry) for tracking request latency, error rates, and resource usage.
*   Set up comprehensive error tracking and reporting with context.
*   Monitor database performance, identify slow queries, and optimize as needed.
*   Establish a process for regular security patching of OS, Node.js, dependencies, and base Docker images.
*   Utilize log analysis and alerting (based on the centralized logging system) to proactively identify issues.

## Implementation Details for Role/Permission-Based UI Control

The permission system will leverage `GraphQL` directives on the server and context/components on the client (`UI`) to dynamically control UI element visibility and data access based on user roles, specific permissions derived from roles, subscriptions, and feature flags.

### Server-Side Implementation

**Permission Resolution in GraphQL Schema:**

The schema will use directives like `@requirePermission` to annotate fields or types that require specific permissions.

```graphql
# schema.ts / schema.gql

# Define the directive
directive @requirePermission(
  feature: String!
  # Optional: Define how to handle lack of permission for a field
  fallbackStrategy: FallbackStrategy = NULL
) on FIELD_DEFINITION | OBJECT # Apply to fields or entire object types

# Define possible fallback strategies
enum FallbackStrategy {
  NULL   # Return null for the field (default)
  ERROR  # Throw a ForbiddenError
  # HIDE is primarily a client-side concept based on metadata or null checks
}

type User {
  id: ID!
  email: String!
  profile: UserProfile
  # Only visible to users with 'user:admin' permission
  internalNotes: String @requirePermission(feature: "user:admin", fallbackStrategy: NULL)
}

type Organization {
  id: ID!
  name: String!
  # Only visible to users with 'billing:view' permission
  billingDetails: BillingDetails @requirePermission(feature: "billing:view")
}

type Query {
  # Entire query might require permission
  adminDashboard: AdminDashboard @requirePermission(feature: "admin:view", fallbackStrategy: ERROR)
}

# Define other necessary types like UserProfile, BillingDetails, AdminDashboard
```

**Permission Directive Implementation:**

A NestJS-compatible directive implementation checks permissions using the `PermissionService`.

```typescript
// permission.directive.ts
import { SchemaDirectiveVisitor } from '@apollo/server-express'; // Or appropriate package
import { defaultFieldResolver, GraphQLField, GraphQLObjectType } from 'graphql';
import { ForbiddenException, AuthenticationError } from '@nestjs/common'; // Use NestJS exceptions
import { PermissionService } from './permission.service'; // Adjust path

export class RequirePermissionDirective extends SchemaDirectiveVisitor {
  visitObject(object: GraphQLObjectType) {
    // Apply permission check to all fields if directive is on the object type
    const fields = object.getFields();
    const { feature, fallbackStrategy } = this.args;

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      this.wrapField(field, feature, fallbackStrategy);
    });

    // Optionally store metadata on the object type itself for client introspection
    // object.extensions = { ...object.extensions, requiresPermission: feature };
  }

  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { feature, fallbackStrategy } = this.args;
    this.wrapField(field, feature, fallbackStrategy);
  }

  private wrapField(field: GraphQLField<any, any>, feature: string, fallbackStrategy: string = 'NULL') {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function(...args) {
      const [source, resolverArgs, context, info] = args;

      // Ensure user context and DI container are available
      if (!context.user || !context.user.id) {
        if (fallbackStrategy === 'ERROR') {
          throw new AuthenticationError('Authentication required to access this field.');
        }
        // Return null/undefined based on strategy if not ERROR
        return fallbackStrategy === 'NULL' ? null : undefined;
      }
      if (!context.container) {
         console.error("DI Container not found in GraphQL context!");
         throw new ForbiddenException("Server configuration error.");
      }

      const permissionService = context.container.get(PermissionService);
      const hasPermission = await permissionService.hasFeatureAccess(
        context.user.id,
        feature
      );

      if (!hasPermission) {
        if (fallbackStrategy === 'ERROR') {
          throw new ForbiddenException(`Missing required permission: ${feature}`);
        }
        return fallbackStrategy === 'NULL' ? null : undefined; // Default to null
      }

      // User has permission, call original resolver
      return resolve.apply(this, args);
    };

    // Add metadata to the field's extensions for potential client-side use via introspection
    field.extensions = {
      ...field.extensions,
      requiresPermission: feature,
      fallbackStrategy: fallbackStrategy
    };

    // Optionally add directive info back to AST node if needed for tooling, though extensions are more common
    /*
    if (!field.astNode.directives.some(d => d.name.value === 'requirePermission')) {
        field.astNode.directives.push({
            kind: 'Directive',
            name: { kind: 'Name', value: 'requirePermission' },
            arguments: [
                { kind: 'Argument', name: { kind: 'Name', value: 'feature' }, value: { kind: 'StringValue', value: feature } },
                { kind: 'Argument', name: { kind: 'Name', value: 'fallbackStrategy' }, value: { kind: 'EnumValue', value: fallbackStrategy } }
            ]
        });
    }
    */
  }
}
```

**Permission Service for Central Access Control:**

The `PermissionService` centralizes permission logic, potentially with caching.

```typescript
// permission.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { Subscription } from './entities/subscription.entity';
import { FeatureFlag } from './entities/feature-flag.entity'; // Assuming FeatureFlag entity
import { LoggingService } from './logging.service'; // Assuming LoggingService
import { RoleType } from './enums/role-type.enum'; // Assuming RoleType enum
import NodeCache from 'node-cache'; // Simple in-memory cache example

@Injectable()
export class PermissionService {
  // Simple in-memory cache with TTL (consider Redis/Memcached for distributed systems)
  private permissionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 min TTL

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
    @InjectRepository(FeatureFlag) private featureFlagRepo: Repository<FeatureFlag>,
    private loggingService: LoggingService
  ) {}

  async hasFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
    const cacheKey = `permissions:${userId}`;
    let userPermissions: Set<string> | undefined = this.permissionCache.get(cacheKey);

    if (!userPermissions) {
      userPermissions = await this.loadUserPermissions(userId);
      this.permissionCache.set(cacheKey, userPermissions);
      this.loggingService.log(`Cache miss for user permissions: ${userId}`, 'PermissionService');
    } else {
      this.loggingService.log(`Cache hit for user permissions: ${userId}`, 'PermissionService');
    }

    // Check for global wildcard or specific permission
    if (userPermissions.has('*') || userPermissions.has(featureKey)) {
      return true;
    }

    // Check for category wildcard (e.g., 'billing:*')
    const category = featureKey.split(':')[0];
    if (userPermissions.has(`${category}:*`)) {
      return true;
    }

    return false;
  }

  private async loadUserPermissions(userId: string): Promise<Set<string>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'organization', 'organization.subscriptions', 'organization.subscriptions.plan', 'organization.subscriptions.plan.features', 'organization.featureFlags'] // Eager load necessary relations
    });

    if (!user) return new Set();

    const permissions = new Set<string>();

    // 1. Add role-based permissions
    if (user.role && user.role.name) {
      this.getRolePermissions(user.role.name).forEach(p => permissions.add(p));
    } else {
        console.warn(`User ${userId} has no role assigned.`);
    }


    // If no organization, we're done with org/sub permissions
    if (!user.organization) return permissions;

    // 2. Add organization-specific feature flags
    user.organization.featureFlags?.forEach(flag => {
        if (flag.enabled) {
            permissions.add(flag.featureKey);
        }
    });

    // 3. Add permissions from active/trialing subscription plan features
    const activeSubscription = user.organization.subscriptions?.find(sub =>
        ['active', 'trialing'].includes(sub.status) && // Stripe often uses 'trialing'
        sub.plan?.features
    );

    activeSubscription?.plan.features.forEach(feature => {
        permissions.add(feature.key); // Assuming feature entity has 'key' property
    });

    // Add implicit self-management permission
    permissions.add(`user:self:${userId}`); // Allow user to manage their own profile maybe?

    return permissions;
  }

  // Define hierarchical or specific role permissions
  private getRolePermissions(role: RoleType): string[] {
    const basePermissions: Record<RoleType, string[]> = {
      [RoleType.GOD_MODE]: ['*'],
      [RoleType.ORG_OWNER]: ['org:*', 'user:*', 'billing:*', 'app:*', 'settings:*', 'featureflag:*'],
      [RoleType.ORG_ADMIN]: ['org:view', 'org:edit', 'user:manage', 'app:manage', 'settings:view', 'featureflag:view'],
      [RoleType.ADMIN]: ['app:manage', 'user:view', 'settings:view'],
      [RoleType.POWER_USER]: ['app:view', 'app:launch', 'user:view'],
      [RoleType.USER]: ['app:view', 'app:launch', 'user:self'], // Base user permissions
      [RoleType.GUEST]: ['app:view:basic'] // Limited guest access
    };

    // Simple non-hierarchical return for this example
    return basePermissions[role] || [];

    // If hierarchical needed, accumulate permissions from lower roles.
  }

  // Invalidate cache for a user when their role, subscription, or org flags change
  invalidateUserPermissions(userId: string): void {
    const cacheKey = `permissions:${userId}`;
    this.permissionCache.del(cacheKey);
    this.loggingService.log(`Invalidated permission cache for user: ${userId}`, 'PermissionService');
  }
}
```

### Client-Side Implementation

**Permission-Aware Apollo Client:**

While modifying responses via Apollo Link is possible, it's often simpler and more performant to fetch all user permissions once and use a React Context to check permissions directly in components. Fetching directive metadata via introspection is also an option but adds complexity.

**React Components for Permission-Based UI:**

Use a Context Provider to hold user permissions and provide a hook for checking them.

```typescript
// PermissionProvider.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, gql } from '@apollo/client'; // Assuming Apollo Client

// Query to fetch all permissions for the currently authenticated user
const GET_USER_PERMISSIONS_QUERY = gql`
  query GetCurrentUserPermissions {
    # Assume 'me' query returns the current user with their effective permissions
    me {
      id
      # This field needs a resolver on the backend that computes all granted permission strings
      effectivePermissions
    }
  }
`;

interface PermissionContextType {
  hasPermission: (feature: string) => boolean;
  isLoading: boolean;
  permissions: Set<string>;
}

const PermissionContext = createContext<PermissionContextType>({
  hasPermission: () => false, // Default to no permission
  isLoading: true,
  permissions: new Set(),
});

export const PermissionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { loading, error, data } = useQuery(GET_USER_PERMISSIONS_QUERY, {
     fetchPolicy: 'cache-and-network', // Ensure fresh permissions on reload/login
     // Skip query if user is not logged in (assuming login state is managed elsewhere)
     // skip: !isUserLoggedIn,
  });

  // Memoize the set of permissions
  const permissions = useMemo(() => {
    if (data?.me?.effectivePermissions) {
      return new Set<string>(data.me.effectivePermissions);
    }
    return new Set<string>();
  }, [data]);

  // Memoize the permission checking function
  const hasPermission = useCallback((featureKey: string): boolean => {
    if (loading || error) return false; // Still loading or error means no confirmed permission

    // Check for global wildcard first
    if (permissions.has('*')) return true;

    // Check for exact permission match
    if (permissions.has(featureKey)) return true;

    // Check for category wildcards (e.g., 'billing:*')
    const category = featureKey.split(':')[0];
    if (permissions.has(`${category}:*`)) return true;

    return false;
  }, [permissions, loading, error]);

  const contextValue = useMemo(() => ({
    hasPermission,
    isLoading: loading,
    permissions // Expose the raw set if needed
  }), [hasPermission, loading, permissions]);

  // Handle error state appropriately, maybe log out user or show error message
  if (error) {
     console.error("Error fetching user permissions:", error);
     // Optionally render an error state or fallback UI
     // return <div>Error loading permissions. Please try refreshing.</div>;
  }

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook to easily access permission checks
export const usePermission = () => useContext(PermissionContext);
```

**Permission-Aware UI Components:**

Components like `PermissionGuard` or `PermissionLink` use the `usePermission` hook.

```typescript
// PermissionGuard.tsx
import React from 'react';
import { usePermission } from './PermissionProvider'; // Adjust path

interface PermissionGuardProps {
  feature: string; // The required permission feature key
  fallback?: React.ReactNode; // Optional: Render this if permission denied
  children: React.ReactNode; // Render this if permission granted
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  feature,
  fallback = null, // Default to rendering nothing if permission denied
  children
}) => {
  const { hasPermission, isLoading } = usePermission();

  // Optional: Show loading state while permissions are loading
  // if (isLoading) {
  //   return <Spinner />; // Or some loading indicator
  // }

  if (!hasPermission(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};


// PermissionLink.tsx (Example showing conditional rendering/disabling)
import React from 'react';
import { Link, LinkProps } from 'react-router-dom'; // Assuming React Router
import { usePermission } from './PermissionProvider'; // Adjust path

interface PermissionLinkProps extends Omit<LinkProps, 'to'> {
  to: string; // Make 'to' required
  feature: string; // Required permission
  // Props to apply when the link is disabled due to permissions
  disabledProps?: React.HTMLAttributes<HTMLSpanElement>;
  children: React.ReactNode;
}

export const PermissionLink: React.FC<PermissionLinkProps> = ({
  feature,
  disabledProps = { style: { opacity: 0.5, cursor: 'not-allowed' }, 'aria-disabled': true },
  children,
  ...props // Rest of the LinkProps (like 'to', 'className', etc.)
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(feature);

  if (!allowed) {
    // Render as a span or div that looks like a disabled link
    return (
      <span {...disabledProps} className={props.className}>
         {children}
      </span>
    );
  }

  // Render the actual Link component if permission is granted
  return <Link {...props}>{children}</Link>;
};
```

**Application Menu with Permission Control:**

Dynamically render menu items based on permissions.

```typescript
// AppMenu.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming React Router
import { usePermission } from './PermissionProvider'; // Adjust path
// Assume Icon components are imported (e.g., DashboardIcon, AppsIcon, etc.)

interface MenuItem {
  name: string;
  // icon: React.ReactNode; // Example icon usage
  path: string;
  feature: string; // Permission required to see this item
  children?: MenuItem[]; // Optional sub-menu items
}

// Define your menu structure with associated feature permissions
const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', feature: 'dashboard:view' },
  { name: 'Applications', path: '/apps', feature: 'app:view' },
  { name: 'Users', path: '/users', feature: 'user:view' },
  {
    name: 'Settings',
    path: '/settings',
    feature: 'settings:view', // Base permission to see 'Settings' group
    children: [
      { name: 'General', path: '/settings/general', feature: 'settings:general:view' },
      { name: 'Billing', path: '/settings/billing', feature: 'billing:view' },
      { name: 'Security', path: '/settings/security', feature: 'settings:security:view' },
      { name: 'Manage Users', path: '/settings/users', feature: 'user:manage' }, // Sub-item needing higher perm
    ]
  },
  { name: 'Admin Panel', path: '/admin', feature: 'admin:*' }, // Admin only section
];

export const AppMenu: React.FC = () => {
  const { hasPermission } = usePermission();

  // Recursive function to render menu items and their children
  const renderMenuItem = (item: MenuItem): React.ReactNode => {
    // 1. Check permission for the item itself
    if (!hasPermission(item.feature)) {
      return null; // Don't render if no permission
    }

    // 2. If it has children, filter them based on their permissions
    const visibleChildren = item.children
      ?.map(child => renderMenuItem(child)) // Recursively render children
      .filter(childNode => childNode !== null); // Remove children without permission

    // 3. Render the item
    // If it's a parent item, render it only if it has visible children (or if it's a direct link itself)
    if (item.children && (!visibleChildren || visibleChildren.length === 0)) {
       // If it was *only* a container for children and has no path itself, hide it.
       // If it *has* its own path, maybe still show it even if children are hidden.
       // Decision depends on desired UX. Here we hide if no visible children.
       // return null; // Uncomment this line to hide parent if all children are hidden
    }

    return (
      <li key={item.path}>
        <Link to={item.path}>{item.name}</Link>
        {/* Render submenu if there are visible children */}
        {visibleChildren && visibleChildren.length > 0 && (
          <ul>
            {visibleChildren}
          </ul>
        )}
      </li>
    );
  };

  return (
    <nav>
      <ul>
        {menuItems.map(renderMenuItem).filter(itemNode => itemNode !== null)}
      </ul>
    </nav>
  );
};
```

## Risk Management

### Technical Risks

*   **Database Schema Complexity**: Complex relationships and frequent migrations can lead to errors and downtime.
*   **OAuth Integration**: Reliance on third-party providers (Google) means changes on their end can break integration. Maintaining multiple OAuth providers adds complexity.
*   **Stripe API Changes**: Stripe updates its API; maintaining compatibility and handling deprecated features requires ongoing effort. Webhook reliability issues.
*   **Permission Logic Performance**: Complex permission checks involving multiple database lookups (roles, subscriptions, flags) could become a bottleneck under load. Cache invalidation complexity.
*   **Scalability of Centralized Logging**: A single logging service API might become a bottleneck or single point of failure under high load. Log storage scaling and cost.

### Mitigation Strategies

*   **Database Migrations**: Use robust migration tools (like TypeORM migrations), test migrations thoroughly in staging, implement blue/green deployments or careful rollout strategies. Keep schema changes incremental.
*   **Third-Party Integrations**: Abstract third-party SDKs behind service interfaces to allow easier swapping or adaptation. Monitor provider updates and test compatibility proactively. Implement robust error handling and fallbacks.
*   **Stripe Integration**: Pin the `stripe-node` library version and plan updates carefully. Implement idempotent webhook handlers and a retry mechanism (possibly using queues) for webhook processing. Monitor Stripe status pages.
*   **Permission Performance**: Implement aggressive caching (in-memory or distributed cache like Redis) for user permissions. Optimize database queries for fetching permission-related data. Design the permission structure efficiently. Use database-level RBAC features if applicable.
*   **Logging Scalability**: Use a message queue (e.g., RabbitMQ, Kafka, SQS) to buffer logs before ingestion by the logging service. Consider a distributed logging architecture (e.g., ELK stack, cloud provider logging services like CloudWatch Logs or Google Cloud Logging) instead of a single custom API endpoint for very high volumes. Ensure log storage is scalable and has appropriate retention policies.

## Conclusion

This revised development plan provides a structured approach to building a secure, scalable `GraphQL` API backend using `NestJS`. It incorporates a dedicated centralized logging service accessed via API endpoints and details a comprehensive role and permission-based system for controlling access to data and `UI` elements.

The permission system integrates deeply from the database structure (roles, feature flags, subscription plans) through the `GraphQL` schema (using directives) to the `UI` components (using React Context and conditional rendering). This multi-layered approach ensures that users only interact with the applications, features, and data they are authorized to access, based on a combination of their role, organization settings, and subscription status, while aiming for a maintainable and performant implementation through techniques like caching.
