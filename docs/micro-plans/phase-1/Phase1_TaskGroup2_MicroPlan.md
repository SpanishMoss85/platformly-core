# Phase 1: Foundation & Core Entities
## Task Group 2: Core Authentication & Basic CRUD

### Authentication Implementation with NextAuth.js

**23. Task:** Configure NextAuth.js Handler (`[...nextauth].ts`)
*   **Mode:** `coder`
*   **Action:** Create NextAuth.js API route handler (`pages/api/auth/[...nextauth].ts`). Add basic `authOptions` structure (providers, adapter placeholder, session strategy).
*   **SAPPO Context:** Implement core :Authentication :Endpoint (:NextAuthJS). Establish :Configuration structure.
*   **Testing:** `tester-tdd` adds **cumulative** integration test: Request `/api/auth/session`, verify unauthenticated response.

**24. Task:** Set up NextAuth.js Credentials Provider
*   **Mode:** `coder`
*   **Action:** Add `CredentialsProvider` to `authOptions`. Implement `authorize` function (fetch user via Prisma, compare hash via `bcrypt`). Install `bcrypt`.
*   **SAPPO Context:** Implement :PasswordBasedAuthentication. Integrate with :Prisma. Use :BCrypt :HashingAlgorithm for :PasswordSecurity, mitigate :PlaintextPasswordStorage :SecurityVulnerability.
*   **Testing:** `tester-tdd` adds **cumulative** unit test for `authorize` (mock Prisma/bcrypt). `tester-tdd` adds **cumulative** integration test: Attempt login via `/api/auth/callback/credentials` (correct/incorrect creds), verify response/session.

**25. Task:** Set up NextAuth.js Google OAuth Provider
*   **Mode:** `coder` / `devops`
*   **Action:** Add `GoogleProvider` to `authOptions`. Configure `clientId`/`clientSecret` via env vars. Set up Google Cloud OAuth credentials.
*   **SAPPO Context:** Implement :OAuthAuthentication (:Google :IdentityProvider). Manage :ClientSecrets securely. Requires :ExternalConfiguration (Google Cloud).
*   **Testing:** Manual Google login test in dev. `tester-tdd` might add E2E test later.

**26. Task:** Configure NextAuth.js Prisma Adapter
*   **Mode:** `coder`
*   **Action:** Install `@next-auth/prisma-adapter`. Configure `PrismaAdapter` in `authOptions` with Prisma Client instance. Ensure schema matches adapter needs.
*   **SAPPO Context:** Integrate :NextAuthJS with :Prisma via :PrismaAdapter :Component. Enables :SessionPersistence, :UserAccountManagement in DB. Ensure :Compatibility.
*   **Testing:** `tester-tdd` enhances **cumulative** integration tests (login/signup) to verify `User`, `Account`, `Session` records created/updated via adapter.

**27. Task:** Implement Email Verification Flow (Optional - Choose Method)
*   **Mode:** `coder` / `spec-writer`
*   **Action:** Choose: A) NextAuth.js Email provider (needs SendGrid/SMTP) OR B) Custom flow (token, email service, verify endpoint). Implement chosen method.
*   **SAPPO Context:** Implement :EmailVerification :Process. :TradeOffs involved. Requires :ThirdPartyIntegration (:SendGrid). Mitigates :FakeAccountCreation :Problem.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests: Trigger email, mock service, simulate click, verify user status update.

**28. Task:** Configure NextAuth.js Session Strategy
*   **Mode:** `coder` / `architect`
*   **Action:** Decide strategy (`jwt: true` or `database: true`). Configure JWT keys (env vars) or ensure DB Session model/adapter correct.
*   **SAPPO Context:** Define :SessionManagement :Strategy (:JWT vs :DatabaseSessions). :TradeOffs involved. Requires secure :SecretManagement (JWT keys).
*   **Testing:** `tester-tdd` adds **cumulative** integration tests verifying session creation/retrieval (`/api/auth/session`) for chosen strategy. Test expiry.

**29. Task:** Secure GraphQL Resolvers/API Routes (Initial)
*   **Mode:** `coder`
*   **Action:** Modify GraphQL context creation (`/api/graphql`) to include user session (`getServerSession`). Add `context.session.user` checks in placeholder resolvers/API routes.
*   **SAPPO Context:** Implement basic :AuthorizationChecks at :APILayer. Integrate :AuthenticationContext into :GraphQLContext/:APIRequestContext. Initial step for :RoleBasedAccessControl.
*   **Testing:** `tester-tdd` enhances **cumulative** integration tests for existing queries/routes: Test access with/without auth, verify success/failure.

### Basic CRUD Operations

**30. Task:** Implement GraphQL Resolvers/API Handlers for `User` CRUD (Basic)
*   **Mode:** `coder`
*   **Action:** Create basic GQL resolvers (`user`, `updateUserProfile`) or REST handlers (`GET /users/{id}`, `PUT /users/me`). Use Prisma Client. Add basic auth (user updates self).
*   **SAPPO Context:** Implement :CRUDOperations for :User :BusinessObject (:GraphQL/:RESTfulAPI). Integrate with :Prisma. Apply initial :ResourceLevelAuthorization.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as user, call endpoint, verify data retrieval/update & auth enforcement.

**31. Task:** Implement GraphQL Resolvers/API Handlers for `Organization` CRUD (Basic)
*   **Mode:** `coder`
*   **Action:** Create basic GQL/REST handlers for Organization (`myOrganization`, `updateOrganization`). Use Prisma Client. Add basic auth (user updates own org).
*   **SAPPO Context:** Implement :CRUDOperations for :Organization :BusinessObject. Apply initial :ResourceLevelAuthorization.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as user, call endpoint, verify data access/update & auth.

**32. Task:** Implement GraphQL Resolvers/API Handlers for `Application` Read (Basic)
*   **Mode:** `coder`
*   **Action:** Create basic GQL/REST handler for reading Applications (`listApplications`). Use Prisma Client. Return all enabled apps initially.
*   **SAPPO Context:** Implement read :CRUDOperations for :Application :BusinessObject. Defer complex auth.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests: Call endpoint, verify list returned.

**33. Task:** Add Input Validation (`zod`)
*   **Mode:** `coder`
*   **Action:** Install `zod`. Define Zod schemas for inputs. Integrate validation into GQL resolvers/API handlers.
*   **SAPPO Context:** Implement :InputValidation (:Zod :Library). Mitigate :InjectionVulnerability, :DataCorruption :Problems. Ensure :DataIntegrity.
*   **Testing:** `tester-tdd` enhances **cumulative** integration tests for mutations/POST/PUT: Send valid/invalid input, verify success/validation error responses.

### Launch Authorization Logic

**34. Task:** Implement `getAuthorizedLaunchUrl` Service Logic
*   **Mode:** `coder`
*   **Action:** Create service function (`services/appLaunch.ts`). Use Prisma to fetch user/org/sub/app data. Implement checks (assignment, status, subscription). Return URL or throw specific errors. Integrate `logger`.
*   **SAPPO Context:** Implement core :AuthorizationLogic for :ApplicationLaunch :UseCase. Complex :DataFetching (:Prisma), :BusinessRuleValidation. Uses :CustomErrorHandling, :Logging.
*   **Testing:** `tester-tdd` adds **cumulative** unit tests for service (mock Prisma/logger), testing various scenarios.

**35. Task:** Create `getAuthorizedLaunchUrl` GraphQL Mutation/API Route
*   **Mode:** `coder`
*   **Action:** Create GQL mutation (`getAuthorizedLaunchUrl`) or API route (`POST /api/launch/{appId}`). Get auth user ID. Call service logic. Handle/translate errors.
*   **SAPPO Context:** Expose :ApplicationLaunch :AuthorizationLogic via :APILayer (:GraphQL/:RESTfulAPI). Handles :AuthenticationContext retrieval, :ErrorTranslation.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as user, call endpoint for different app/user states, verify URL/error based on service logic scenarios.

### Security Foundations

**36. Task:** Implement Security Headers (Helmet adaptation)
*   **Mode:** `coder` / `security-reviewer`
*   **Action:** Add security headers (like `helmet`) to Next.js API responses (middleware/direct).
*   **SAPPO Context:** Enhance :WebSecurity (:SecurityHeaders). Mitigates :Clickjacking, :XSS. Requires adapting patterns to :NextJS.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests checking for key security headers in API responses.

**37. Task:** Configure CORS Settings
*   **Mode:** `coder` / `devops`
*   **Action:** Configure CORS for API routes (`next.config.js` or route options/middleware) allowing frontend domain.
*   **SAPPO Context:** Configure :CORS policy for :APILayer access control.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests checking CORS headers in API responses.

**38. Task:** Set up Basic Rate Limiting
*   **Mode:** `coder` / `devops`
*   **Action:** Implement rate limiting on critical API routes (auth, launch, GQL). Choose library (`node-rate-limiter-flexible`, `upstash/ratelimit`) and integrate.
*   **SAPPO Context:** Implement :RateLimiting :Mechanism to mitigate :DenialOfService, :BruteForceAttack. Requires :Technology choice/config.
*   **Testing:** `tester-tdd` adds **cumulative** integration tests: Send bursts of requests, verify rate limiting responses (429).

**39. Task:** Verify NextAuth.js CSRF Protection
*   **Mode:** `security-reviewer` / `tester-tdd`
*   **Action:** Confirm NextAuth.js default CSRF protection (double submit cookie) is active.
*   **SAPPO Context:** Leverage built-in :CSRFProtection (:NextAuthJS) to mitigate :CSRF :SecurityVulnerability.
*   **Testing:** `tester-tdd` **cumulative** integration tests ensure CSRF tokens/cookies present in relevant NextAuth.js requests. Manual testing important.

### Testing & Documentation (Phase 1 Wrap-up)

**40. Task:** Set up Unit/Integration Test Runner (Jest/Vitest)
*   **Mode:** `tester-tdd` / `devops`
*   **Action:** Install/configure Jest or Vitest (TypeScript, React plugins, mocks). Set up test scripts in `package.json`.
*   **SAPPO Context:** Establish :TestingFramework (:Jest/:Vitest) for :UnitTesting, :IntegrationTesting. Configure :TestEnvironment.
*   **Testing:** Verify setup with empty suite. Add test execution to **cumulative** CI pipeline.

**41. Task:** Write Initial Unit/Integration Tests (Consolidation)
*   **Mode:** `tester-tdd`
*   **Action:** Ensure all **cumulative** unit/integration tests from previous tasks (Auth, CRUD, Launch, Security, etc.) are implemented and passing. Refactor setup/mocks.
*   **SAPPO Context:** Implement initial :TestCases for Phase 1 features. Build :CumulativeTesting suite foundation. Use :Mocking.
*   **Testing:** Run full test suite (`npm test`). Ensure all pass.

**42. Task:** Document API Endpoints (Initial)
*   **Mode:** `docs-writer`
*   **Action:** Generate initial GQL schema docs or create basic OpenAPI/Markdown for REST routes (request/response formats, auth).
*   **SAPPO Context:** Create initial :APIDocumentation. Improves :DeveloperExperience, :Maintainability. Format choice (:GraphQL Schema Docs/:OpenAPI).
*   **Testing:** Manually review docs for accuracy/completeness.

**43. Task:** Prepare README.md and .env.example
*   **Mode:** `docs-writer`
*   **Action:** Update `README.md` (description, setup, run instructions). Create/update `.env.example` with all required env vars.
*   **SAPPO Context:** Provide essential :ProjectDocumentation (:README), :ConfigurationGuidance (`.env.example`). Critical for :Onboarding, :DeveloperExperience.
*   **Testing:** Manually review README/.env.example for clarity/completeness.