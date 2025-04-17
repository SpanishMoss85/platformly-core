# Phase 5, Task Group 1: API Logging Route Enhancements - Micro-Plan

**Goal:** Enhance the existing API logging infrastructure by implementing a robust query route with filtering, pagination, and proper authorization, and consider integration with monitoring/alerting systems.

**SAPPO Context:**
*   **:ArchitecturalPattern:** :APIGateway (Next.js API Routes), :QueryService (for log retrieval), :RepositoryPattern (if abstracting log storage).
*   **:ComponentRole:** `LogQueryAPIHandler`, `LogQueryService` (encapsulates query logic), `LogRepository` (optional, abstracts storage).
*   **:Technology:** Next.js API Routes, Prisma (if storing logs in DB), potentially external log stores (Elasticsearch, Loki), Zod (for query validation).
*   **:Problem Mitigation:** Address :InformationLeak by securing the query endpoint with RBAC. Mitigate :PerformanceIssues in log querying via pagination, indexing (if DB), or offloading to a dedicated log store. Ensure :DataIntegrity through input validation on query parameters. Avoid :ScalabilityBottleneck by designing the query service efficiently.

---

## Micro-Tasks:

**1. Define Log Query DTOs:**
    *   **Task:** Define Data Transfer Objects (DTOs) using Zod (or similar) for log query parameters (`LogQueryDto`) and the response structure (`LogResponseDto`).
    *   `LogQueryDto` should include optional fields for: `level`, `startDate`, `endDate`, `service`, `messageContains`, `userId`, `organizationId`, `page`, `pageSize`.
    *   `LogResponseDto` should include: `logs` (array of log objects), `totalCount`, `page`, `pageSize`, `totalPages`.
    *   **Specialist:** Spec Writer
    *   **Input:** Logging schema defined in Phase 1.
    *   **Output:** `dto/logging.dto.ts` (or similar) defining Zod schemas for `LogQueryDto` and `LogResponseDto`.
    *   **SAPPO:** :DataModeling, :InputValidation.

**2. Implement Log Query Service:**
    *   **Task:** Create a `LogQueryService` module containing a `queryLogs` function. This function should:
        *   Accept a validated `LogQueryDto` object.
        *   Construct a query based on the provided filters (level, date range, text search, IDs).
        *   Interact with the log storage mechanism (e.g., Prisma query against a log table, API call to Elasticsearch/Loki).
        *   Implement pagination logic (calculating offset/limit based on `page` and `pageSize`).
        *   Retrieve the total count of matching logs for pagination metadata.
        *   Return data matching the `LogResponseDto` structure.
        *   Handle potential errors during query execution.
    *   **Specialist:** Coder
    *   **Input:** `LogQueryDto`, `LogResponseDto`, Log storage mechanism details (Prisma schema or external service client).
    *   **Output:** `services/logQueryService.ts` with `queryLogs` implementation.
    *   **SAPPO:** :QueryOptimization, :Pagination, :RepositoryPattern (Implicit or Explicit), :ErrorHandling.

**3. Enhance Log Query API Route:**
    *   **Task:** Update the existing `/api/logs/query` Next.js API route handler. This handler should:
        *   Use `getServerSession` to authenticate the request and get user details (ID, role, organizationId).
        *   Perform RBAC checks: Allow access only for specific roles (e.g., `GOD_MODE`, `ORG_OWNER`, `ORG_ADMIN`).
        *   Validate the incoming query parameters (`req.query`) against the `LogQueryDto` using a validation utility.
        *   Enforce data scoping: If the user is not `GOD_MODE`, automatically filter queries by their `organizationId`. Prevent non-`GOD_MODE` users from querying other organizations' logs.
        *   Call the `queryLogs` service function with the validated and scoped query parameters.
        *   Return the `LogResponseDto` from the service or appropriate error responses (400 for validation, 401 for auth, 403 for forbidden, 500 for internal).
    *   **Specialist:** Coder
    *   **Input:** API route file, `LogQueryDto`, `LogResponseDto`, `services/logQueryService.ts`, NextAuth.js session logic, RBAC utilities.
    *   **Output:** Updated `/api/logs/query` route handler with validation, authorization, scoping, and service call.
    *   **SAPPO:** :APIDesign, :Security (Authentication, Authorization), :InputValidation, :DataFiltering.

**4. Implement Log Rotation/Retention (If Applicable):**
    *   **Task:** If logs are stored locally (database table or files), implement a basic rotation/retention strategy.
    *   For database: Create a scheduled job (e.g., using a cron library like `node-cron` within a separate process, or a serverless function) to periodically delete logs older than a defined retention period (e.g., 30 days).
    *   For files: Use a logging library that supports rotation (e.g., `winston-daily-rotate-file`) or implement a script for cleanup.
    *   **Specialist:** DevOps / Coder
    *   **Input:** Log storage mechanism details, desired retention period.
    *   **Output:** Scheduled job implementation or logging library configuration for rotation/retention.
    *   **SAPPO:** :DataLifecycleManagement, :ScheduledTask.

**5. Alerting/Monitoring Integration (Basic):**
    *   **Task:** (Optional, depending on requirements/log store) Set up basic alerting.
    *   If using an external log platform (e.g., Datadog, Sentry): Configure alerts within that platform based on log queries (e.g., alert on > N errors per minute).
    *   If logging locally: Consider adding logic to the log ingestion or a separate monitoring process to detect critical error patterns and trigger notifications (e.g., email via SendGrid).
    *   **Specialist:** DevOps / Coder
    *   **Input:** Log storage/platform details, alerting criteria.
    *   **Output:** Alerting configuration or notification triggering logic.
    *   **SAPPO:** :Monitoring, :Alerting, :Notification.

**6. Testing Log Query Functionality:**
    *   **Task:** Write unit/integration tests for:
        *   `LogQueryService` (mocking the storage interaction).
        *   `/api/logs/query` route handler (mocking service, testing validation, auth, scoping).
        *   Test various filter combinations and pagination.
        *   Test RBAC enforcement for the query endpoint.
    *   **Specialist:** Tester
    *   **Input:** Code from previous steps, testing framework.
    *   **Output:** Test files covering the log query functionality.
    *   **SAPPO:** :Testing (Unit, Integration), :Mocking.

**7. Documentation Update:**
    *   **Task:** Document the enhanced `/api/logs/query` endpoint, including:
        *   Required permissions.
        *   Available query parameters (filters, pagination).
        *   Response format (`LogResponseDto`).
        *   Example usage.
    *   **Specialist:** Docs Writer
    *   **Input:** API route implementation, DTO definitions.
    *   **Output:** Updated API documentation.
    *   **SAPPO:** :Documentation.

---
**Next Step:** Phase 5, Task Group 2: Advanced Security & Finalization.