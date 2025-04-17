Project Overview
This development plan outlines the implementation of a secure, scalable GraphQL API backend using Node.js and NestJS. The system will manage users, organizations, applications, and subscriptions with robust authentication, role-based access control, and third-party integrations.
Core Architecture Components

Backend Framework: NestJS with TypeScript
API Layer: GraphQL with Apollo Server
Database: PostgreSQL with TypeORM
Authentication: JWT, Email/Password, Google OAuth
Authorization: Role-Based Access Control (RBAC)
Integrations: Stripe, SendGrid
Logging: Centralized logging service with API endpoints
Testing: Jest for unit and integration tests
Frontend Styling: TailwindCSS (to be implemented in frontend phase)

Development Plan
Phase 1: Foundation & Core Entities
Task Group 1: Project Setup & Database Configuration

Initialize NestJS project with TypeScript configuration

Set up project structure following NestJS best practices
Configure TypeScript with strict type checking
Establish linting rules and code formatting standards


Database & ORM Configuration

Set up PostgreSQL connection using TypeORM
Define TypeORM entities with proper relationships:

User (with role and organization relations)
Role (enum-based)
Organization (with owner relation)
Application (with enabled flag)
OrganizationApplication (join entity)
Subscription (with organization relation)


Generate and test initial database migrations
Implement database seeding module for roles and admin user


GraphQL Schema Foundation

Set up Apollo Server with NestJS
Define initial GraphQL types matching entity structure
Configure GraphQL playground for development


Centralized Logging Service

Create logging microservice with API endpoints
Implement structured JSON logging with severity levels
Design logging schema with environment, context, and user information
Set up log rotation and retention policies in centralized storage
Create client module for application components to use

Example Logging Service Client:
typescript// logging.service.ts
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


Task Group 2: Core Authentication & Basic CRUD

Authentication Implementation

Implement secure password hashing with bcrypt
Create registration and login resolvers with JWT generation
Set up SendGrid integration for email verification
Configure secure HttpOnly cookie storage for JWT
Implement basic auth guards for GraphQL resolvers


Basic CRUD Operations

Implement User queries and mutations
Implement Organization queries and mutations
Implement Application queries and mutations
Add input validation with class-validator


Launch Authorization Logic

Implement getAuthorizedLaunchUrl mutation
Create logic for checking subscription status
Validate application assignments and enablement
Return appropriate URL or error messages

Example getAuthorizedLaunchUrl Service Method:
typescript// app-launch.service.ts
@Injectable()
export class AppLaunchService {
  constructor(
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

    if (!user.organization) {
      throw new UnauthorizedException('User is not associated with an organization');
    }

    const orgId = user.organization.id;

    // Check if app is assigned to organization
    const orgApp = await this.orgAppRepo.findOne({
      where: { orgId, appId }
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
        status: In(['active', 'trial'])
      }
    });

    if (!subscription) {
      throw new UnauthorizedException('Organization does not have an active subscription');
    }

    // All checks passed, return the launch URL
    return app.launchUrl;
  }
}

Security Foundations

Implement Helmet for HTTP security headers
Configure secure CORS settings
Set up basic rate limiting


Testing & Documentation

Set up Jest testing framework
Write unit tests for authentication flows
Create integration tests for CRUD operations
Document API endpoints and authentication flow
Prepare README.md and .env.example files



Phase 2: RBAC & Enhanced Authentication
Task Group 1: Role-Based Access Control and Permissions

Feature Flag & Permissions System

Design a flexible permissions system with feature flags
Implement dynamic permissions based on user roles, subscription levels, and context
Create a centralized permission service for checking access rights
Set up database schema for storing feature flags and permissions

Example Permission Service:
typescript// permission.service.ts
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
      relations: ['role', 'organization']
    });

    if (!user) return false;

    // Check role-based permissions first (highest priority)
    if (this.hasRolePermission(user.role.name, featureKey)) {
      return true;
    }

    // If no organization, no further checks needed
    if (!user.organization) return false;

    // Check organization-level feature flags
    const orgFeatureFlag = await this.featureFlagRepo.findOne({
      where: {
        organizationId: user.organization.id,
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
      relations: ['plan']
    });

    if (!subscription) return false;

    // Check if feature is included in subscription plan
    return subscription.plan.includedFeatures.includes(featureKey);
  }

  // Check if user can access/view a specific application
  async canAccessApplication(userId: string, appId: string): Promise<boolean> {
    // Implementation logic
    return await this.hasFeatureAccess(userId, `app:${appId}`);
  }

  // Helper method to determine if a role has a specific permission
  private hasRolePermission(role: RoleType, featureKey: string): boolean {
    // Role permission mappings
    const rolePermissions = {
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

UI Visibility Control with Directives

Implement GraphQL directive for permission-based field visibility
Create directive resolver for client-side permission checking
Design permission-aware GraphQL schema with authorization metadata
Set up client-side visibility control with directive data

Example GraphQL Directive:
typescript// permission.directive.ts
@Directive('@requirePermission(feature: String!)')
export class RequirePermissionDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    const { feature } = this.args;

    field.resolve = async function(...args) {
      const [, , context] = args;
      const permissionService = context.container.get(PermissionService);

      // Check if user has required permission
      const hasPermission = await permissionService.hasFeatureAccess(
        context.userId,
        feature
      );

      // If no permission, return null or throw error based on configuration
      if (!hasPermission) {
        if (context.permissionStrategy === 'NULL') {
          return null;
        } else {
          throw new ForbiddenException(`Missing permission: ${feature}`);
        }
      }

      // User has permission, resolve normally
      return resolve.apply(this, args);
    };

    // Add metadata for client visibility control
    field.extensions = {
      ...field.extensions,
      requiresPermission: feature
    };
  }
}
Example UI Permission Schema:
typescript// app.schema.graphql
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

Client-Side Permission Integration

Design Apollo Client plugin for permission-based UI rendering
Create higher-order components for permission-based visibility
Implement reactive permission checking
Set up permission caching and invalidation

Example React Permission Component:
typescript// PermissionGuard.tsx
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
  const { loading, error, data } = useQuery(CHECK_PERMISSION_QUERY, {
    variables: { feature }
  });

  if (loading) return <Spinner size="sm" />;
  if (error) return fallback;

  return data.hasPermission ? children : fallback;
};

// Usage in component:
<PermissionGuard feature="billing:manage">
  <UpdateSubscriptionButton />
</PermissionGuard>

Complete RBAC System

Define role hierarchy and permissions matrix
Implement custom RBAC decorators and guards
Create role management resolvers (assign/revoke)
Apply appropriate guards to all existing resolvers

Example Enhanced RBAC Guard:
typescript// roles.guard.ts
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
    const { user } = gqlContext.getContext().req;

    if (!user) {
      return false;
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

    // Check if user's role has sufficient permissions
    return requiredRoles.some(role => {
      const requiredRoleIndex = roleHierarchy.indexOf(role);
      return userRoleIndex <= requiredRoleIndex;
    });
  }
}
Example Combined Decorators:
typescript// access-control.decorators.ts
export const RequireRoles = (...roles: RoleType[]) => SetMetadata('roles', roles);
export const RequireFeatures = (...features: string[]) => SetMetadata('features', features);

// Usage in resolver:
@Mutation(returns => Boolean)
@RequireRoles(RoleType.ORG_ADMIN, RoleType.ORG_OWNER)
@RequireFeatures('user:manage')
async assignUserToOrganization(
  @Args('userId') userId: string,
  @Args('organizationId') organizationId: string
): Promise<boolean> {
  // Implementation
}

Resource Access Control

Implement organization membership validation
Add ownership checks for organization resources
Create organization user management functionality
Test access control with different user scenarios



Task Group 2: Authentication Enhancements

OAuth Integration

Implement Google OAuth 2.0 authentication
Create user account linking (OAuth to existing accounts)
Add social login resolvers and handlers
Test OAuth flows with mock providers


Authentication Refinements

Implement password reset functionality
Add email verification workflows
Create session management capabilities
Implement multi-device logout functionality


Testing & Validation

Write comprehensive RBAC unit tests
Create OAuth integration tests
Test session management and security features
Validate authorization across different user roles



Phase 3: Admin Features & Application Management
Task Group 1: Admin Functionality

GodMode and Admin Capabilities

Implement user management with role assignment
Create organization management functionality
Add system-wide settings and configurations
Implement administrative queries and reporting


Application Catalog Management

Create application CRUD operations for admins
Implement application status management
Add application metadata and configuration options
Create batch operations for applications



Task Group 2: Organization-Application Management

Application Assignment System

Implement organization-application assignments
Create bulk assignment capabilities
Add assignment history and tracking
Implement assignment validation rules


Admin Interface Enhancements

Organize GraphQL schema for admin operations
Create admin-specific query/mutation groups
Enhance GraphQL playground with documentation
Add examples for common admin operations


Testing & Validation

Write unit tests for admin functionality
Create integration tests for application management
Test organization-application assignments
Validate admin-only access controls



Phase 4: Stripe Integration & Subscription Management
Task Group 1: Stripe Core Integration

Stripe Setup

Integrate stripe-node library
Set up Stripe customer creation and management
Link organizations to Stripe customers
Implement Stripe API error handling

Example Stripe Service:
typescript// stripe.service.ts
@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private organizationRepo: Repository<Organization>,
    private subscriptionRepo: Repository<Subscription>,
    private loggingService: LoggingService
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16', // Use appropriate version
    });
  }

  async createStripeCustomer(organizationId: string): Promise<string> {
    try {
      const organization = await this.organizationRepo.findOne({
        where: { id: organizationId },
        relations: ['owner']
      });

      if (!organization) {
        throw new NotFoundException('Organization not found');
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
        organization.owner.id,
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
  ): Promise<Subscription> {
    try {
      const organization = await this.organizationRepo.findOne({
        where: { id: organizationId }
      });

      if (!organization?.stripeCustomerId) {
        throw new BadRequestException('Organization has no Stripe customer ID');
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
        expand: ['latest_invoice.payment_intent']
      });

      // Create local subscription record
      const subscription = this.subscriptionRepo.create({
        organization,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        status: stripeSubscription.status,
        planType: 'recurring',
        startDate: new Date(stripeSubscription.current_period_start * 1000),
        endDate: new Date(stripeSubscription.current_period_end * 1000)
      });

      await this.subscriptionRepo.save(subscription);

      // Update org's active subscription
      await this.organizationRepo.update(
        { id: organizationId },
        { activeSubscription: subscription }
      );

      this.loggingService.audit(
        'subscription_created',
        {
          subscriptionId: subscription.id,
          stripeSubscriptionId: stripeSubscription.id
        },
        'system',
        'organization',
        organizationId
      );

      return subscription;
    } catch (error) {
      this.handleStripeError(error);
    }
  }

  private handleStripeError(error: any): never {
    if (error instanceof Stripe.errors.StripeError) {
      switch (error.type) {
        case 'StripeCardError':
          throw new BadRequestException(`Payment failed: ${error.message}`);
        case 'StripeInvalidRequestError':
          throw new BadRequestException(`Invalid request: ${error.message}`);
        case 'StripeAPIError':
          throw new InternalServerErrorException('Stripe API error');
        default:
          throw new InternalServerErrorException('Payment processing error');
      }
    }
    throw error;
  }
}

Subscription Management

Create subscription creation resolvers
Implement recurring subscription handling
Add free trial subscription capabilities
Create one-time payment functionality



Task Group 2: Subscription Lifecycle & Webhooks

Webhook Implementation

Create secure Stripe webhook endpoints
Implement event handlers for subscription events
Add payment success/failure handling
Create subscription status update logic

Example Stripe Webhook Controller:
typescript// stripe-webhook.controller.ts
@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(
    private configService: ConfigService,
    private subscriptionService: SubscriptionService,
    private loggingService: LoggingService
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request
  ) {
    if (!signature) {
      throw new BadRequestException('Stripe signature is missing');
    }

    // Raw body parsing setup required in main.ts
    const payload = request.body;
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      // Validate the webhook signature
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      // Log webhook event
      this.loggingService.audit(
        'stripe_webhook_received',
        { type: event.type },
        'system',
        'webhook',
        event.id
      );

      // Process different webhook events
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCanceled(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        default:
          this.loggingService.log(`Unhandled Stripe event: ${event.type}`);
      }

      return { received: true };
    } catch (err) {
      this.loggingService.error('Webhook error', err.message);
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const stripeSubId = subscription.id;
    const status = subscription.status;

    await this.subscriptionService.updateSubscriptionStatus(stripeSubId, status);

    this.loggingService.audit(
      'subscription_updated',
      { status },
      'system',
      'subscription',
      stripeSubId
    );
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const stripeSubId = subscription.id;

    await this.subscriptionService.cancelSubscription(stripeSubId);

    this.loggingService.audit(
      'subscription_canceled',
      { status: subscription.status },
      'system',
      'subscription',
      stripeSubId
    );
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (invoice.subscription) {
      await this.subscriptionService.updateSubscriptionAfterPayment(
        invoice.subscription as string,
        true
      );

      this.loggingService.audit(
        'payment_succeeded',
        { amount: invoice.amount_paid },
        'system',
        'subscription',
        invoice.subscription as string
      );
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    if (invoice.subscription) {
      await this.subscriptionService.updateSubscriptionAfterPayment(
        invoice.subscription as string,
        false
      );

      this.loggingService.audit(
        'payment_failed',
        { attempt: invoice.attempt_count },
        'system',
        'subscription',
        invoice.subscription as string
      );
    }
  }
}

Subscription Status Management

Enhance getAuthorizedLaunchUrl with subscription validation
Implement subscription status checking
Add subscription renewal notifications
Create payment failure handling


Testing & Validation

Write unit tests for Stripe integration
Create mock webhook events for testing
Test subscription lifecycle scenarios
Validate payment and subscription flows



Phase 5: Advanced Security & System Finalization
Task Group 1: Centralized Logging Enhancements

Logging Service API Completion

Enhance the centralized logging API with filtering and search capabilities
Implement log aggregation and analysis features
Create dashboards for monitoring system activity
Set up alerting for critical events and errors

Example Enhanced Logging API:
typescript// logging.controller.ts
@Controller('api/logs')
export class LoggingController {
  constructor(
    private logService: LogService,
    private authService: AuthService
  ) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  async createLog(@Body() logEntry: CreateLogDto): Promise<LogEntryDto> {
    return this.logService.createLog(logEntry);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.GOD_MODE, RoleType.ORG_OWNER)
  async getLogs(
    @Query() query: LogQueryDto,
    @CurrentUser() user: User
  ): Promise<LogResponseDto> {
    // Apply organization filter for non-GOD_MODE users
    if (user.role.name !== RoleType.GOD_MODE) {
      query.organizationId = user.organization.id;
    }

    return this.logService.findLogs(query);
  }

  @Get('audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequireRoles(RoleType.GOD_MODE, RoleType.ORG_OWNER)
  async getAuditLogs(
    @Query() query: AuditLogQueryDto,
    @CurrentUser() user: User
  ): Promise<AuditLogResponseDto> {
    // Apply organization filter for non-GOD_MODE users
    if (user.role.name !== RoleType.GOD_MODE) {
      query.targetEntity = 'organization';
      query.targetId = user.organization.id;
    }

    return this.logService.findAuditLogs(query);
  }
}


Task Group 2: Advanced Security & Finalization

Enhanced Security Measures

Implement configurable rate limiting
Create IP allow/block list functionality
Add CSRF protection with tokens
Enhance input validation and sanitization


System Hardening

Implement security headers and policies
Add brute force protection
Create suspicious activity detection
Implement automated security testing


Documentation & Finalization

Complete API documentation
Finalize README with setup instructions
Create environment variable documentation
Add deployment and scaling guidelines



Key Milestones & Deliverables
Phase 1 Deliverables

Functional NestJS project with TypeScript
PostgreSQL database with defined entities
Working authentication system with JWT
Basic CRUD operations for core entities
Initial getAuthorizedLaunchUrl implementation
Centralized logging service with API endpoints
Security foundations implemented
Unit and integration tests for base functionality

Phase 2 Deliverables

Complete RBAC and permission system with feature flags
Client-side permission and visibility controls
Google OAuth integration
Enhanced authentication workflows
Comprehensive RBAC tests
Resource ownership validation

Phase 3 Deliverables

Admin-specific GraphQL operations
Application management system
Organization-application assignment functionality
Enhanced GraphQL playground documentation
Admin functionality tests

Phase 4 Deliverables

Stripe integration for payments
Subscription management system
Webhook handlers for Stripe events
Subscription status validation in launch URL
Comprehensive payment flow tests

Phase 5 Deliverables

Enhanced centralized logging service
Audit logging for system events
Advanced security measures
Comprehensive documentation
Final system hardening and tests

Testing Strategy
Unit Testing

Individual component tests for resolvers
Service method validation
Guard and decorator testing
Input validation verification

Integration Testing

End-to-end API flows
RetryClaude hit the max length for a message and has paused its response. You can write Continue to keep the chat going.AContinueEditTesting Strategy (continued)
Integration Testing

End-to-end API flows
Authentication workflow validation
Subscription and payment process testing
Admin functionality verification
Permission-based access control validation

Security Testing

Authentication bypass attempts
Authorization circumvention testing
Input validation attack testing
Rate limiting verification
Permission edge case testing
Cross-site request forgery (CSRF) protection verification

Deployment Considerations
Environment Configuration

Development, testing, and production environments
Environment-specific configurations
Secrets management strategy
Feature flag configuration by environment

CI/CD Pipeline

Automated testing on commits
Linting and code quality checks
Database migration validation
Deployment automation
Security scanning during build process

Monitoring & Maintenance

Error tracking and reporting
Performance monitoring
Database query optimization
Security patch management
Log analysis and alerting

Implementation Details for Role/Permission-Based UI Control
The permission system will leverage GraphQL directives and client-side components to dynamically control UI visibility based on user roles, permissions, and subscription status.
Server-Side Implementation

Permission Resolution in GraphQL Schema:

typescript// schema.ts
const typeDefs = gql`
  directive @requirePermission(
    feature: String!
    fallbackStrategy: FallbackStrategy = NULL
  ) on FIELD_DEFINITION | OBJECT

  enum FallbackStrategy {
    NULL
    ERROR
    HIDE
  }

  type User {
    id: ID!
    email: String!
    profile: UserProfile
    # Only visible to users with admin permissions
    internalNotes: String @requirePermission(feature: "user:admin")
  }

  type Organization {
    id: ID!
    name: String!
    # Only visible to org owners and admins
    billingDetails: BillingDetails @requirePermission(feature: "billing:view")
  }

  type Query {
    # Only accessible to users with admin:view permission
    adminDashboard: AdminDashboard @requirePermission(feature: "admin:view")
  }
`;

Permission Directive Implementation:

typescript// permission.directive.ts
export class RequirePermissionDirective extends SchemaDirectiveVisitor {
  visitObject(object: GraphQLObjectType) {
    this.ensureFieldsWrapped(object);
    // Store directive info in metadata for client usage
    object['requiresPermission'] = this.args.feature;
  }

  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    const { feature, fallbackStrategy } = this.args;

    field.resolve = async function(...args) {
      const [, , context] = args;

      if (!context.user) {
        if (fallbackStrategy === 'ERROR') {
          throw new AuthenticationError('Authentication required');
        }
        return fallbackStrategy === 'NULL' ? null : undefined;
      }

      const permissionService = context.container.get(PermissionService);
      const hasPermission = await permissionService.hasFeatureAccess(
        context.user.id,
        feature
      );

      if (!hasPermission) {
        if (fallbackStrategy === 'ERROR') {
          throw new ForbiddenException(`Missing permission: ${feature}`);
        }
        return fallbackStrategy === 'NULL' ? null : undefined;
      }

      return resolve.apply(this, args);
    };

    // Add to field metadata for introspection
    field.astNode.directives.push({
      name: { value: 'requirePermission' },
      arguments: [
        { name: { value: 'feature' }, value: { kind: 'StringValue', value: feature } }
      ]
    });
  }
}

Permission Service for Central Access Control:

typescript// permission.service.ts
@Injectable()
export class PermissionService {
  constructor(
    private userRepo: Repository<User>,
    private subscriptionRepo: Repository<Subscription>,
    private featureFlagRepo: Repository<FeatureFlag>,
    private loggingService: LoggingService
  ) {}

  // Cache permissions for better performance
  private permissionCache = new Map<string, {
    permissions: Set<string>;
    expiry: number;
  }>();

  async hasFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
    // Check cache first
    const cacheKey = `${userId}:${featureKey}`;
    const now = Date.now();
    const cached = this.permissionCache.get(cacheKey);

    if (cached && cached.expiry > now) {
      return cached.permissions.has(featureKey);
    }

    // Cache miss - load all permissions for this user
    const permissions = await this.loadUserPermissions(userId);

    // Store in cache with 5-minute expiry
    this.permissionCache.set(cacheKey, {
      permissions,
      expiry: now + 5 * 60 * 1000
    });

    return permissions.has(featureKey);
  }

  private async loadUserPermissions(userId: string): Promise<Set<string>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'organization']
    });

    if (!user) return new Set();

    // Start with role-based permissions
    const permissions = new Set(this.getRolePermissions(user.role.name));

    // If no organization, we're done
    if (!user.organization) return permissions;

    // Add organization-specific permissions
    const orgFeatures = await this.featureFlagRepo.find({
      where: { organizationId: user.organization.id, enabled: true }
    });

    orgFeatures.forEach(feature => permissions.add(feature.featureKey));

    // Add subscription-based permissions
    const subscription = await this.subscriptionRepo.findOne({
      where: {
        organization: { id: user.organization.id },
        status: In(['active', 'trial'])
      },
      relations: ['plan', 'plan.features']
    });

    if (subscription?.plan?.features) {
      subscription.plan.features.forEach(feature => {
        permissions.add(feature.key);
      });
    }

    return permissions;
  }

  private getRolePermissions(role: RoleType): string[] {
    // Hierarchical permission mapping
    const permissions: Record<RoleType, string[]> = {
      [RoleType.GOD_MODE]: ['*'], // All permissions
      [RoleType.ORG_OWNER]: [
        'org:*', 'user:*', 'billing:*', 'app:*', 'settings:*'
      ],
      [RoleType.ORG_ADMIN]: [
        'org:view', 'org:edit', 'user:*', 'app:*', 'settings:view'
      ],
      [RoleType.ADMIN]: [
        'app:*', 'user:view', 'settings:view'
      ],
      [RoleType.POWER_USER]: [
        'app:view', 'app:edit', 'user:view'
      ],
      [RoleType.USER]: [
        'app:view', 'user:self'
      ],
      [RoleType.GUEST]: [
        'app:view:basic'
      ]
    };

    return permissions[role] || [];
  }

  // Invalidate cache for a user when permissions change
  invalidateUserPermissions(userId: string): void {
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.permissionCache.delete(key);
      }
    }
  }
}
Client-Side Implementation

Permission-Aware Apollo Client:

typescript// permissionAwareLink.ts
export const createPermissionAwareLink = () => {
  return new ApolloLink((operation, forward) => {
    return forward(operation).map(response => {
      // Check permissions and modify response
      const context = operation.getContext();
      const { currentUser } = context;

      if (!currentUser) return response;

      // Process response with permission checks
      processResponseWithPermissions(response, currentUser.permissions);

      return response;
    });
  });
};

// Process GraphQL response and remove fields user doesn't have access to
function processResponseWithPermissions(response: any, userPermissions: string[]) {
  const { data } = response;
  if (!data) return;

  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value && typeof value === 'object') {
      // Check field level permissions
      const fieldPermission = value.__requiresPermission;
      if (fieldPermission && !hasPermission(userPermissions, fieldPermission)) {
        data[key] = null;
        return;
      }

      // Recursively process nested objects
      processResponseWithPermissions({ data: value }, userPermissions);
    }
  });
}

function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Check for wildcards and specific permissions
  if (userPermissions.includes('*')) return true;

  const [category, action] = requiredPermission.split(':');
  if (userPermissions.includes(`${category}:*`)) return true;

  return userPermissions.includes(requiredPermission);
}

React Components for Permission-Based UI:

typescript// PermissionProvider.tsx
interface PermissionContextType {
  checkPermission: (feature: string) => boolean;
  hasPermission: (feature: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  checkPermission: () => false,
  hasPermission: () => false
});

export const PermissionProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { data } = useQuery(GET_USER_PERMISSIONS);
  const permissions = useMemo(() => {
    return new Set(data?.currentUser?.permissions || []);
  }, [data]);

  const checkPermission = useCallback((feature: string) => {
    // Check for wildcards first
    if (permissions.has('*')) return true;

    // Check for category wildcards (e.g., 'billing:*')
    const category = feature.split(':')[0];
    if (permissions.has(`${category}:*`)) return true;

    // Check for exact permission match
    return permissions.has(feature);
  }, [permissions]);

  const value = useMemo(() => ({
    checkPermission,
    hasPermission: checkPermission
  }), [checkPermission]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);

Permission-Aware UI Components:

typescript// PermissionGuard.tsx
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
  const { hasPermission } = usePermission();

  if (!hasPermission(feature)) {
    return fallback;
  }

  return <>{children}</>;
};

// PermissionLink.tsx
interface PermissionLinkProps extends LinkProps {
  feature: string;
  disabledProps?: Partial<LinkProps>;
}

export const PermissionLink: React.FC<PermissionLinkProps> = ({
  feature,
  disabledProps = { as: 'span', className: 'disabled-link' },
  children,
  ...props
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(feature);

  if (!allowed) {
    return <span {...disabledProps}>{children}</span>;
  }

  return <Link {...props}>{children}</Link>;
};

Application Menu with Permission Control:

typescript// AppMenu.tsx
interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  feature: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    feature: 'app:view'
  },
  {
    name: 'Applications',
    icon: <AppsIcon />,
    path: '/apps',
    feature: 'app:view'
  },
  {
    name: 'Users',
    icon: <UsersIcon />,
    path: '/users',
    feature: 'user:view'
  },
  {
    name: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
    feature: 'settings:view',
    children: [
      {
        name: 'General',
        icon: <GeneralIcon />,
        path: '/settings/general',
        feature: 'settings:view'
      },
      {
        name: 'Billing',
        icon: <BillingIcon />,
        path: '/settings/billing',
        feature: 'billing:view'
      },
      {
        name: 'Security',
        icon: <SecurityIcon />,
        path: '/settings/security',
        feature: 'settings:security'
      }
    ]
  }
];

export const AppMenu: React.FC = () => {
  const { hasPermission } = usePermission();

  const renderMenuItem = (item: MenuItem) => {
    // Skip items user doesn't have permission for
    if (!hasPermission(item.feature)) {
      return null;
    }

    // If it has children, render as dropdown
    if (item.children && item.children.length > 0) {
      const visibleChildren = item.children.filter(child =>
        hasPermission(child.feature)
      );

      // If no visible children, don't render parent either
      if (visibleChildren.length === 0) {
        return null;
      }

      return (
        <li key={item.path} className="menu-item dropdown">
          <span className="dropdown-toggle">
            {item.icon}
            {item.name}
          </span>
          <ul className="dropdown-menu">
            {visibleChildren.map(renderMenuItem)}
          </ul>
        </li>
      );
    }

    // Regular menu item
    return (
      <li key={item.path} className="menu-item">
        <Link href={item.path}>
          {item.icon}
          {item.name}
        </Link>
      </li>
    );
  };

  return (
    <nav className="app-navigation">
      <ul className="menu">
        {menuItems.map(renderMenuItem)}
      </ul>
    </nav>
  );
};
Risk Management
Technical Risks

Database schema complexity and migration challenges
OAuth integration complexity with third-party changes
Stripe API version compatibility
Performance bottlenecks with complex permission checks
Scalability challenges with centralized logging

Mitigation Strategies

Comprehensive testing of database migrations
Loose coupling with third-party services
Stripe API version pinning and update strategy
Permission caching and optimization
Distributed logging architecture with queue buffering

Conclusion
This revised development plan provides a structured approach to building a secure, scalable GraphQL API with NestJS. The implementation addresses the specific requirements for centralized logging through dedicated API endpoints rather than local file logging. The permission-based UI control system provides a robust and flexible way to manage visibility and access based on user roles, permissions, and subscription status, ensuring users only see applications and features they have access to.
The permission system integrates at multiple levels—database, GraphQL schema, and UI components—creating a cohesive authorization framework that maintains security while providing a seamless user experience. By implementing feature flags and permission-based visibility controls, the application will efficiently handle complex access requirements without compromising performance.
