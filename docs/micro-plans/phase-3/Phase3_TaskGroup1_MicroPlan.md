**Phase 3: Admin Features & Application Management**
**Task Group 1: Admin Functionality**

***`GodMode` and Admin Capabilities***

67. **Task:** Implement `GOD_MODE` Role Check Enhancement
    *   **Mode:** `coder`
    *   **Action:** Refine `hasPermission` utility or create `isGodMode(userId)` helper for efficient `GOD_MODE` role check, bypassing standard logic where needed.
    *   **SAPPO Context:** Implement specific :AuthorizationLogic for :SuperAdminRole (`GOD_MODE`). Allows bypassing :MultiTenancy constraints.
    *   **Testing:** `tester-tdd` enhances **cumulative** unit tests for `hasPermission`/`isGodMode` covering `GOD_MODE` scenarios.

68. **Task:** Create Admin User Management API Endpoints/Mutations
    *   **Mode:** `coder`
    *   **Action:** Implement API/GQL endpoints for `GOD_MODE` to manage *all* users (list, view, update role). Protect strictly with `GOD_MODE` check. Implement Prisma queries (bypass org scopes).
    *   **SAPPO Context:** Implement :AdminFunctionality for :UserManagement. Requires careful :AuthorizationChecks (`GOD_MODE`), potentially bypassing :DataFiltering.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as `GOD_MODE`, call endpoints, verify cross-org user management. Test denial for non-`GOD_MODE`.

69. **Task:** Create Admin Organization Management API Endpoints/Mutations
    *   **Mode:** `coder`
    *   **Action:** Implement API/GQL endpoints for `GOD_MODE` to manage *all* orgs (list, view, modify). Protect strictly with `GOD_MODE` check. Implement Prisma queries.
    *   **SAPPO Context:** Implement :AdminFunctionality for :OrganizationManagement. Requires strict `GOD_MODE` :AuthorizationChecks.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as `GOD_MODE`, call endpoints, verify org management. Test denial for non-`GOD_MODE`.

70. **Task:** Create Admin System Settings API Endpoints (If Applicable)
    *   **Mode:** `coder` / `architect`
    *   **Action:** If system settings exist: Design storage (DB/config). Implement API/GQL endpoints for `GOD_MODE` to view/modify. Protect strictly with `GOD_MODE` check.
    *   **SAPPO Context:** Implement :AdminFunctionality for :SystemConfigurationManagement. Requires :ConfigurationStorage design, strict `GOD_MODE` :AuthorizationChecks.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests (if applicable): Auth as `GOD_MODE`, view/modify settings, verify persistence. Test denial.

71. **Task:** Implement Admin Reporting API Endpoints/Queries
    *   **Mode:** `coder`
    *   **Action:** Implement API/GQL queries for `GOD_MODE` reports (user counts, sub summary). Protect strictly with `GOD_MODE` check. Implement Prisma aggregation queries.
    *   **SAPPO Context:** Implement :AdminFunctionality for :SystemReporting. May involve complex :DataAggregation (:Prisma). Requires strict `GOD_MODE` :AuthorizationChecks.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as `GOD_MODE`, call endpoints, verify data format/correctness (mocking may be needed). Test denial.

***Application Catalog Management***

72. **Task:** Extend `Application` Model/Schema (Admin Fields)
    *   **Mode:** `coder`
    *   **Action:** Add admin-specific fields to `Application` model (`prisma/schema.prisma`). Generate/apply migration.
    *   **SAPPO Context:** Evolve :DataModel (:Application) for :AdminFunctionality. Update :DatabaseSchema, manage :DatabaseMigration.
    *   **Testing:** `prisma format`. `tester-tdd` adds **cumulative** integration tests later verifying new field storage/retrieval.

73. **Task:** Implement Admin Application CRUD API Endpoints/Mutations
    *   **Mode:** `coder`
    *   **Action:** Create admin-only API/GQL endpoints for `Application` CRUD (create, read, update, delete, manage `isEnabled`). Protect strictly with `GOD_MODE` (or `app:admin:manage` permission).
    *   **SAPPO Context:** Implement :AdminFunctionality for :ApplicationCatalogManagement (:CRUDOperations). Requires strict `GOD_MODE`/admin perm :AuthorizationChecks.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as `GOD_MODE`, perform CRUD on apps, verify DB changes. Test denial for non-admins.

74. **Task:** Implement Admin Batch Application Enable/Disable (Optional)
    *   **Mode:** `coder`
    *   **Action:** If required: Implement API/GQL endpoint for `GOD_MODE` batch enable/disable apps. Protect strictly with `GOD_MODE` check.
    *   **SAPPO Context:** Implement :BatchOperation for :AdminFunctionality. Improves :Efficiency. Requires careful :TransactionManagement.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests (if implemented): Auth as `GOD_MODE`, call batch endpoint, verify status updates in DB.