**Phase 2: RBAC & Enhanced Authentication**
**Task Group 2: Authentication Enhancements**

***OAuth Integration***

59. **Task:** Test & Refine Google OAuth Integration
    *   **Mode:** `coder` / `tester-tdd`
    *   **Action:** Test Google OAuth sign-up/sign-in flows. Ensure Prisma Adapter handles account linking correctly. Debug issues.
    *   **SAPPO Context:** Verify :OAuthAuthentication (:Google). Ensure correct :AccountLinking (:PrismaAdapter). Address :IntegrationBugs.
    *   **Testing:** Manual testing of sequences. `tester-tdd` enhances **cumulative** integration tests for linking or adds E2E tests.

***Authentication Refinements***

60. **Task:** Implement Password Reset Request API Route
    *   **Mode:** `coder`
    *   **Action:** Create `POST /api/auth/password-reset/request`. Input: email. Logic: Find user, generate secure token, store hash/expiry in DB (extend `User` or add `PasswordResetToken` model, migrate), send reset email (via SendGrid) with token link.
    *   **SAPPO Context:** Implement :PasswordReset (Request). Involves :SecureTokenGeneration, :TokenPersistence (DB), :ThirdPartyIntegration (Email). Mitigates :AccountLockout. Requires :DatabaseSchema evolution.
    *   **Testing:** `tester-tdd` adds **cumulative** unit tests for token logic (mock Prisma/crypto). `tester-tdd` adds **cumulative** integration test: Call endpoint, verify token stored (mock email).

61. **Task:** Implement Password Reset Handling Page/API Route
    *   **Mode:** `coder`
    *   **Action:** Create page (`/auth/password-reset/[token]`) & API route (`POST /api/auth/password-reset/confirm`). Page: form. API: Input: token, new password. Logic: Find/validate token, find user, hash new password (`bcrypt`), update user password, invalidate token.
    *   **SAPPO Context:** Implement :PasswordReset (Confirmation). Involves :TokenValidation, :SecurePasswordUpdate (:BCrypt). Requires careful :ErrorHandling.
    *   **Testing:** `tester-tdd` adds **cumulative** integration test: Simulate request, call confirm endpoint (valid/invalid/expired token), verify password update & token invalidation. E2E test covers UI flow.

62. **Task:** Implement Email Verification Flow (If Custom Method Chosen in Task 27)
    *   **Mode:** `coder`
    *   **Action:** If custom flow: Implement token generation, email sending, and verification endpoint/page (update user `emailVerified` status).
    *   **SAPPO Context:** Complete custom :EmailVerification :Process (if applicable). Involves :TokenGeneration, :TokenValidation, :DatabaseUpdate.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests for the custom flow (similar to Task 27 testing).

63. **Task:** Review & Configure Session Management Details
    *   **Mode:** `coder` / `architect`
    *   **Action:** Review NextAuth.js session options (`authOptions`). Configure `maxAge`, `updateAge`, etc. based on requirements. Ensure strategy (JWT/DB) is appropriate.
    *   **SAPPO Context:** Fine-tune :SessionManagement :Configuration. Balance :Security vs :UserExperience.
    *   **Testing:** Manual testing of expiry/refresh. `tester-tdd` enhances **cumulative** session tests (Task 28) to verify durations if feasible.

64. **Task:** Design/Implement Multi-Device Logout (Optional/Advanced)
    *   **Mode:** `architect` / `coder`
    *   **Action:** Design: A) DB sessions: endpoint deletes user sessions except current. B) JWT: maintain valid JWT list (Redis/DB), endpoint revokes. Implement chosen approach.
    *   **SAPPO Context:** Implement advanced :SessionInvalidation (:MultiDeviceLogout). :Complexity varies (DB easier than JWT). JWT approach adds :StateManagement challenges.
    *   **Testing:** `tester-tdd` adds **cumulative** integration tests: Log in simulated devices, call logout, verify other sessions invalidated (check DB/revocation list).

***Testing & Validation (Phase 2 Wrap-up)***

65. **Task:** Write Unit/Integration Tests for RBAC & Auth Enhancements (Consolidation)
    *   **Mode:** `tester-tdd`
    *   **Action:** Ensure all **cumulative** unit/integration tests from Phase 2 tasks (RBAC, OAuth, password reset, email verify, session, multi-logout) are implemented and passing. Refactor.
    *   **SAPPO Context:** Implement :TestCases for Phase 2 features (:RBAC, :AuthenticationEnhancements). Expand :CumulativeTesting suite. Verify :AuthorizationLogic, :AuthenticationFlows.
    *   **Testing:** Run full test suite (`npm test`). Ensure all pass.

66. **Task:** Perform Security Testing on Auth/Authz Endpoints
    *   **Mode:** `security-reviewer` / `tester-tdd`
    *   **Action:** Conduct focused testing on Phase 1 & 2 auth/authz endpoints. Check for IDOR, permission bypass, token leakage, timing attacks, etc.
    *   **SAPPO Context:** Perform targeted :SecurityTesting on critical :Authentication/:Authorization components. Identify potential :SecurityVulnerabilities.
    *   **Testing:** Manual pen-testing techniques. SAST/DAST tools. Add specific negative test cases to **cumulative** integration tests based on findings.