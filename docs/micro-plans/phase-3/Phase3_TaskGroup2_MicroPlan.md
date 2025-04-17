**Phase 3: Admin Features & Application Management**
**Task Group 2: Organization-Application Management**

***Application Assignment System***

75. **Task:** Implement Application Assign/Unassign API Endpoint/Mutation
    *   **Mode:** `coder`
    *   **Action:** Create API/GQL endpoint (e.g., `POST/DELETE /api/orgs/{orgId}/applications/{appId}`) to manage `OrganizationApplication` records. Protect with `GOD_MODE` or `ORG_OWNER`/`ORG_ADMIN` (`app:assign` perm). Use Prisma Client to create/delete join record.
    *   **SAPPO Context:** Implement :ApplicationAssignment :Functionality via :APILayer. Manages :ManyToMany :Relationship (:JoinTable). Requires :AuthorizationChecks (`GOD_MODE`/`app:assign`) & :MultiTenancy scoping.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests: Auth as admin/owner, assign/unassign apps, verify `OrganizationApplication` records created/deleted. Test permission denial.

76. **Task:** Implement Validation for Application Assignment
    *   **Mode:** `coder`
    *   **Action:** Enhance assign endpoint (Task 75): check if `Application` exists and is `isEnabled` before creating `OrganizationApplication` record. Prevent assigning disabled apps.
    *   **SAPPO Context:** Add :BusinessRuleValidation to :ApplicationAssignment. Prevents assignment of :DisabledApplication, ensures :DataIntegrity.
    *   **Testing:** `tester-tdd` enhances **cumulative** integration tests for assignment: Attempt assign non-existent/disabled app, verify error & no record created.

77. **Task:** Implement Bulk Application Assignment API Endpoint (Optional)
    *   **Mode:** `coder`
    *   **Action:** If required: Implement API/GQL endpoint for bulk assignment (e.g., `POST /api/admin/applications/{appId}/assign-to-orgs`). Protect with `GOD_MODE`/admin perms. Use Prisma `createMany` or loop with transaction.
    *   **SAPPO Context:** Implement :BatchOperation for :ApplicationAssignment. Improves :Efficiency for :AdminFunctionality. Requires :InputValidation & :TransactionManagement.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests (if implemented): Auth as admin, call bulk endpoint, verify multiple records created. Test partial failures.

78. **Task:** Add Assignment History/Tracking (Optional)
    *   **Mode:** `coder` / `architect`
    *   **Action:** If required: Design schema changes (e.g., `assignedAt`/`By` on `OrganizationApplication`, or `AssignmentLog` model). Update assignment endpoints to record history. Migrate.
    *   **SAPPO Context:** Implement :AuditLogging for :ApplicationAssignment. Enhances :Traceability. Requires :DatabaseSchema evolution.
    *   **Testing:** `tester-tdd` enhances **cumulative** integration tests for assignment: Verify history fields/log records created.

***Admin Interface Enhancements***

79. **Task:** Structure Admin API Routes/GraphQL Schema
    *   **Mode:** `architect` / `coder`
    *   **Action:** Review API/GQL schema. Ensure admin operations grouped logically (e.g., `/api/admin/` prefix, `AdminMutation`/`Query` type). Refactor if needed.
    *   **SAPPO Context:** Improve :APIStructure for :Maintainability/:Clarity by separating :AdminFunctionality. Follows :SeparationOfConcerns.
    *   **Testing:** Code review. Existing integration tests cover structure.

80. **Task:** Enhance Admin API Documentation
    *   **Mode:** `docs-writer`
    *   **Action:** Update API docs (GQL schema docs, OpenAPI, Markdown). Include all Phase 3 admin endpoints, mark as admin-only, add examples.
    *   **SAPPO Context:** Update :APIDocumentation for :AdminFunctionality. Improves :DeveloperExperience.
    *   **Testing:** Manually review docs for completeness/accuracy regarding Phase 3 admin features.

***Testing & Validation (Phase 3 Wrap-up)***

81. **Task:** Write Unit/Integration Tests for Admin Features (Consolidation)
    *   **Mode:** `tester-tdd`
    *   **Action:** Ensure all **cumulative** unit/integration tests from Phase 3 tasks (Admin capabilities, App Catalog CRUD, App Assignment) are implemented and passing. Refactor.
    *   **SAPPO Context:** Implement :TestCases for Phase 3 features (:AdminFunctionality). Expand :CumulativeTesting suite. Verify implementation & :AuthorizationChecks.
    *   **Testing:** Run full test suite (`npm test`). Ensure all pass.