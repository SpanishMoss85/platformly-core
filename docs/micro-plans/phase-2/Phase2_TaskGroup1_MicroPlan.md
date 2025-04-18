**Phase 2: RBAC & Enhanced Authentication**
**Task Group 1: Role-Based Access Control and Permissions**

**_Feature Flag & Permissions System_**

44. **Task:** Design Permissions System Structure

    - **Mode:** `architect` / `spec-writer`
    - **Action:** Define permission string format (e.g., `resource:action:scope`). Decide if static role-based or dynamic (DB/plan-linked). Document structure & initial list.
    - **SAPPO Context:** Design :AuthorizationModel (:RBAC). Define :Permission granularity/structure. Consider :Flexibility vs :Complexity :TradeOffs. Plan for :Extensibility.
    - **Testing:** N/A for design.

45. **Task:** Extend Prisma Schema for Permissions (If Needed)

    - **Mode:** `coder`
    - **Action:** If dynamic permissions chosen, update `prisma/schema.prisma` (add fields/models for permissions). Generate/apply migration (`prisma migrate dev`).
    - **SAPPO Context:** Evolve :DataModel for :AuthorizationModel. Update :DatabaseSchema. Manage :DatabaseMigration.
    - **Testing:** `prisma format`. `tester-tdd` adds **cumulative** integration tests later verifying permission storage/retrieval.

46. **Task:** Implement Centralized Permission Checking Utility (`utils/permissions.ts`)
    - **Mode:** `coder`
    - **Action:** Create/update `utils/permissions.ts`. Implement `hasPermission(userId, featureKey)` logic (fetch user/role/org/sub via Prisma, check static maps/dynamic DB/plan features, handle wildcards).
    - **SAPPO Context:** Implement core :PermissionChecking :Logic (:UtilityFunction). Encapsulates :AuthorizationRules. Interacts with :Prisma. Handles :WildcardPermissions.
    - **Testing:** `tester-tdd` adds **cumulative** unit tests for `hasPermission` (mock Prisma, test roles/perms/subs/features/wildcards).

**_UI Visibility Control / API Enforcement_** (Choose one or combine)

_Option A: GraphQL Directives_

47. **Task:** Implement `@requirePermission` GraphQL Directive Logic

    - **Mode:** `coder`
    - **Action:** Create directive transformer (`@graphql-tools/utils`). Logic: extract `feature`, get user ID from context, call `hasPermission`, throw `ForbiddenError` or return null on fail.
    - **SAPPO Context:** Implement :GraphQLDirective for declarative :AuthorizationChecks in :GraphQLSchema. Uses :SchemaTransformation. Integrates with :PermissionChecking utility. Handles :ErrorHandling (:ForbiddenError).
    - **Testing:** `tester-tdd` adds **cumulative** unit tests for directive logic (mock `hasPermission`, context, resolver).

48. **Task:** Apply `@requirePermission` Directive to GraphQL Schema
    - **Mode:** `coder`
    - **Action:** Define `@requirePermission` in SDL. Apply to fields/queries/mutations with `feature` argument.
    - **SAPPO Context:** Apply declarative :AuthorizationRules to :GraphQLSchema (:APIContract). Links schema to :Permissions.
    - **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth with/without perms, query/mutate protected fields, verify access granted/denied.

_Option B: API Route Middleware / Handler Checks_

49. **Task:** Implement API Route Permission Middleware/Wrapper

    - **Mode:** `coder`
    - **Action:** Create middleware/HOF (`withPermissions`). Takes feature key. Gets session (`getServerSession`), calls `hasPermission`, returns 403 on fail, else calls handler.
    - **SAPPO Context:** Implement :AuthorizationChecks for :RESTfulAPI (:MiddlewarePattern/:HigherOrderFunction). Integrates with :NextAuthJS session, :PermissionChecking utility. Handles :HTTPErrorResponse (403).
    - **Testing:** `tester-tdd` adds **cumulative** unit tests for middleware/wrapper (mock `hasPermission`, session, handler).

50. **Task:** Apply Permission Checks to API Routes
    - **Mode:** `coder`
    - **Action:** Apply `withPermissions` wrapper (or inline `hasPermission` checks) to relevant API route handlers.
    - **SAPPO Context:** Enforce :AuthorizationRules on :APIEndpoints.
    - **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth with/without perms, access protected routes, verify 2xx or 403 responses.

**_Client-Side Permission Integration_**

51. **Task:** Create API Endpoint/GraphQL Query to Fetch User Permissions

    - **Mode:** `coder`
    - **Action:** Create API route (`GET /api/users/me/permissions`) or GQL query (`myPermissions { permissions }`) returning effective permission strings for auth user.
    - **SAPPO Context:** Provide :Endpoint for frontend to fetch :UserPermissions :Data.
    - **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as different users, call endpoint/query, verify correct permission strings returned.

52. **Task:** Implement Client-Side Permission State Management

    - **Mode:** `coder`
    - **Action:** Implement React context/state slice (Zustand/Redux) to fetch (SWR/React Query) and store user permissions from Task 51 endpoint. Provide `usePermissions` hook.
    - **SAPPO Context:** Manage :ClientSideState for :UserPermissions. Use :DataFetching library (:SWR) & :StateManagement pattern (:ReactContext/:Zustand).
    - **Testing:** `tester-tdd` adds **cumulative** unit tests for state logic/hook (mock fetch).

53. **Task:** Implement `PermissionGuard` Component / `useHasPermission` Hook

    - **Mode:** `coder`
    - **Action:** Create `PermissionGuard` component or `useHasPermission` hook. Takes `feature`. Uses `usePermissions` hook to check feature in user's list (handle wildcards). Conditionally render/return boolean.
    - **SAPPO Context:** Implement :ClientSideAuthorization :UIComponent/:Hook. Controls :UIConditionalRendering based on :UserPermissions.
    - **Testing:** `tester-tdd` adds **cumulative** unit tests for component/hook (test different permission lists/features).

54. **Task:** Apply Client-Side Permission Checks to UI Elements
    - **Mode:** `coder`
    - **Action:** Wrap UI elements with `PermissionGuard` or use `useHasPermission` to conditionally render/disable based on required permissions.
    - **SAPPO Context:** Apply :ClientSideAuthorization to :UserInterface. Enhances :UserExperience. Server checks provide security.
    - **Testing:** Manual UI testing. `tester-tdd` might add **cumulative** E2E tests verifying UI elements visible/hidden/disabled correctly per role.

**_Complete RBAC System_**

55. **Task:** Finalize Role Hierarchy & Permission Mappings

    - **Mode:** `architect` / `coder`
    - **Action:** Review/finalize roles (`RoleType`) and static permission mappings (`utils/permissions.ts` or seed data). Ensure consistency with design (Task 44).
    - **SAPPO Context:** Finalize :RBAC :Configuration. Ensure design/implementation alignment.
    - **Testing:** Code review. Unit tests for `hasPermission` (Task 46) cover mappings.

56. **Task:** Implement Role Management API Endpoints/Mutations

    - **Mode:** `coder`
    - **Action:** Create API routes/GQL mutations for assigning/revoking roles (`POST /api/orgs/{orgId}/users/{userId}/role`). Protect with admin/owner perms (`user:manage:roles`) using Task 47-50 checks.
    - **SAPPO Context:** Implement :RoleManagement :Functionality via :APILayer. Apply :AuthorizationChecks.
    - **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as admin/owner, assign/revoke roles, verify DB changes. Test access denial for non-admins.

57. **Task:** Implement Resource Access Control Checks (Org Ownership)

    - **Mode:** `coder`
    - **Action:** Enhance CRUD API routes/resolvers (Tasks 30, 31) to enforce users only access/modify resources in their own org (unless `GOD_MODE`). Check user `organizationId` vs resource `organizationId`.
    - **SAPPO Context:** Implement :MultiTenancy :AuthorizationChecks. Enforce :DataIsolation. Critical for :Security in :SaaS :ApplicationArchitecture.
    - **Testing:** `tester-tdd` enhances **cumulative** integration tests for CRUD: Attempt cross-org access/modification, verify denial. Verify `GOD_MODE` access (if intended).

58. **Task:** Implement User Management within Organization API Endpoints
    - **Mode:** `coder`
    - **Action:** Create API routes/mutations for inviting/removing users from org, changing role (link to Task 56). Protect with `user:manage` perm. Scope actions to caller's org (unless `GOD_MODE`).
    - **SAPPO Context:** Implement :UserManagement :Functionality within :Organization :Context. Apply :AuthorizationChecks, :MultiTenancy rules.
    - **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as owner/admin, invite/remove users, verify DB changes/membership. Test access denial for regular users/cross-org attempts.
