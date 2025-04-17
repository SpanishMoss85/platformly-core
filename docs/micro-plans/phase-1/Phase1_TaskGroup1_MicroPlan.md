**Phase 1: Foundation & Core Entities**
**Task Group 1: Project Setup & Database Configuration**

***Project Initialization***

1.  **Task:** Initialize Next.js Project Foundation
    *   **Mode:** `devops` / `coder`
    *   **Action:** Run `npx create-next-app@latest --typescript --eslint --tailwind --app .` (or similar) to initialize the project using App Router, TypeScript, ESLint, TailwindCSS.
    *   **SAPPO Context:** Establish :ProjectScaffolding using :NextJS :Framework, :TypeScript :Language. Configure :CodeStyle enforcement (:ESLint/:Prettier).
    *   **Testing:** N/A for initial setup, but adds to **cumulative** test suite foundation.

2.  **Task:** Configure Strict TypeScript
    *   **Mode:** `coder`
    *   **Action:** Modify `tsconfig.json` for strict type checking (`strict: true`, etc.).
    *   **SAPPO Context:** Enhance :CodeQuality via :StrictTypeChecking to mitigate :TypeError :Problems.
    *   **Testing:** Run `tsc --noEmit`. Add to **cumulative** test/build process.

3.  **Task:** Refine ESLint/Prettier Configuration
    *   **Mode:** `coder`
    *   **Action:** Update `.eslintrc.json`, `.prettierrc.js` with project rules/standard configs.
    *   **SAPPO Context:** Standardize :CodeStyle for :Maintainability, reduce :CodeReviewFriction :Problems.
    *   **Testing:** Run `eslint .`, `prettier --check .`. Add to **cumulative** test/linting process.

***Database & ORM Configuration with Prisma***

4.  **Task:** Install Prisma Dependencies
    *   **Mode:** `devops` / `coder`
    *   **Action:** Execute `npm install prisma --save-dev` and `npm install @prisma/client`.
    *   **SAPPO Context:** Introduce :Prisma :ORM :Technology :Dependency.
    *   **Testing:** Verify `npx prisma -v`. Add dependency check to **cumulative** CI validation.

5.  **Task:** Initialize Prisma Configuration
    *   **Mode:** `devops` / `coder`
    *   **Action:** Run `npx prisma init --datasource-provider postgresql`. Review/commit `prisma/schema.prisma`, `.env` (ensure `.env` in `.gitignore`).
    *   **SAPPO Context:** Configure :Prisma :ORM for :PostgreSQL :Database :Technology. Establish :DataSource config.
    *   **Testing:** Verify file creation. Add check to **cumulative** setup validation.

6.  **Task:** Configure Database Connection URL
    *   **Mode:** `coder` / `devops`
    *   **Action:** Update `DATABASE_URL` in `.env`. Ensure `.env` is in `.gitignore`.
    *   **SAPPO Context:** Define :DatabaseConnection string, mitigate :HardcodedSecret :SecurityVulnerability via env vars.
    *   **Testing:** Indirectly validated by first migration. Ensure `.gitignore` includes `.env`.

7.  **Task:** Define Core Models (User, Org, Role) in Prisma Schema
    *   **Mode:** `coder` / `spec-writer`
    *   **Action:** Edit `prisma/schema.prisma`. Define `User`, `Organization`, `Role` models/enum with fields/relations.
    *   **SAPPO Context:** Establish initial :DataModel for :BusinessObjects (:User, :Organization). Define :DatabaseSchema, :Relationships. Consider :DataSchemaRigidity :Problem.
    *   **Testing:** Run `npx prisma format`. Add schema validation to **cumulative** CI. `tester-tdd` adds **cumulative** integration tests later.

8.  **Task:** Define App-Related Models (App, OrgApp) in Prisma Schema
    *   **Mode:** `coder`
    *   **Action:** Edit `prisma/schema.prisma`. Define `Application`, `OrganizationApplication` models with fields/relations.
    *   **SAPPO Context:** Extend :DataModel for app management. Implement many-to-many :Relationship (:JoinTable pattern).
    *   **Testing:** Run `npx prisma format`. `tester-tdd` adds **cumulative** integration tests later.

9.  **Task:** Define Subscription Model in Prisma Schema
    *   **Mode:** `coder`
    *   **Action:** Edit `prisma/schema.prisma`. Define `Subscription` model with Stripe IDs, status, relation to `Organization`.
    *   **SAPPO Context:** Define :DataModel for :Billing :Context, prepare for :ThirdPartyIntegration (Stripe).
    *   **Testing:** Run `npx prisma format`. `tester-tdd` adds **cumulative** integration tests later.

10. **Task:** Define NextAuth.js Models in Prisma Schema
    *   **Mode:** `coder`
    *   **Action:** Edit `prisma/schema.prisma`. Add `Account`, `Session`, `VerificationToken` models. Ensure `User` model meets `next-auth/prisma-adapter` requirements.
    *   **SAPPO Context:** Integrate :Authentication :DataModel from :NextAuthJS :Technology. Ensure :Compatibility.
    *   **Testing:** Run `npx prisma format`. `tester-tdd` adds **cumulative** integration tests for adapter interactions later.

11. **Task:** Generate Initial Database Migration
    *   **Mode:** `devops` / `coder`
    *   **Action:** Execute `npx prisma migrate dev --name init`. Review/commit SQL migration file.
    *   **SAPPO Context:** Implement :DatabaseSchemaManagement (:PrismaMigrate :Tool). Create initial :DatabaseMigration. Mitigate :SchemaDrift :Problem.
    *   **Testing:** Verify migration generation/application. Add `prisma migrate status` check to **cumulative** CI/CD.

12. **Task:** Create Prisma Seed Script Structure
    *   **Mode:** `coder`
    *   **Action:** Create `prisma/seed.ts`. Add basic setup (`@prisma/client`). Update `package.json` (`prisma.seed` script).
    *   **SAPPO Context:** Establish :DatabaseSeeding framework for :ReferenceData/test data. Improves :DeveloperExperience.
    *   **Testing:** Verify script structure, `package.json` update.

13. **Task:** Implement Seeding Logic for Roles & Admin User
    *   **Mode:** `coder`
    *   **Action:** Add logic to `prisma/seed.ts` to create default Roles and admin `User` (`GOD_MODE`). Use `upsert` for idempotency.
    *   **SAPPO Context:** Populate :ReferenceData (Roles), initial :AdminUser. Use :Upsert pattern for :Idempotency.
    *   **Testing:** Run `npx prisma db seed`. Verify data. Add seed execution to **cumulative** setup scripts.

***GraphQL API Route Setup***

14. **Task:** Install GraphQL Server Dependencies
    *   **Mode:** `coder`
    *   **Action:** Execute `npm install @apollo/server graphql`.
    *   **SAPPO Context:** Add :GraphQL :APITechnology :Dependencies (:ApolloServer).
    *   **Testing:** Verify installation. Add to **cumulative** dependency checks.

15. **Task:** Create Basic GraphQL API Route Handler
    *   **Mode:** `coder`
    *   **Action:** Create API route (`pages/api/graphql.ts` or `app/api/graphql/route.ts`). Implement basic Apollo Server setup with minimal placeholder schema.
    *   **SAPPO Context:** Implement :GraphQL Endpoint via :NextJS API Routes. Establish basic :APIServer structure for :GraphQL :APILayer.
    *   **Testing:** Start dev server. Access `/api/graphql`. Add basic health check query to **cumulative** integration tests (`tester-tdd`).

16. **Task:** Configure GraphQL Playground/Explorer Access
    *   **Mode:** `coder`
    *   **Action:** Ensure Apollo Server config enables playground (Apollo Sandbox) in development.
    *   **SAPPO Context:** Enhance :DeveloperExperience via interactive :GraphQL Playground.
    *   **Testing:** Access playground URL in browser during dev.

17. **Task:** Define Initial GraphQL Schema (SDL) for Core Models
    *   **Mode:** `coder` / `spec-writer`
    *   **Action:** Update GraphQL schema (inline or `.graphql` file). Define `Query`, `Mutation`, types for `User`, `Organization`, `Role`. Add placeholder queries.
    *   **SAPPO Context:** Define initial :GraphQLSchema reflecting core :DataModel. Establish :APIContract. Consider :CodeGeneration tools to mitigate :SchemaMismatch :Problem.
    *   **Testing:** Validate schema syntax. `tester-tdd` adds **cumulative** integration tests later.

***API Logging Route Setup***

18. **Task:** Design Logging Schema/Interface
    *   **Mode:** `spec-writer` / `architect`
    *   **Action:** Define log entry structure (TypeScript interface/DTO) with fields (`timestamp`, `level`, `message`, etc.). Document structure.
    *   **SAPPO Context:** Define :DataContract for :LogData. Ensures :Consistency.
    *   **Testing:** N/A for definition, used by subsequent tasks.

19. **Task:** Create Log Ingestion API Route (`/api/logs/ingest`)
    *   **Mode:** `coder`
    *   **Action:** Create Next.js API route. Implement basic logic to accept POST JSON matching schema. Log to console/temp file initially. Add basic input validation.
    *   **SAPPO Context:** Implement :LogIngestion :Endpoint/:APIService. Defer complex storage.
    *   **Testing:** `tester-tdd` adds **cumulative** integration test: Send valid/invalid payloads, verify responses (2xx/4xx).

20. **Task:** Implement Basic Log Storage (Initial)
    *   **Mode:** `coder`
    *   **Action:** Enhance `/api/logs/ingest`. Implement simple file-based logging (append to `.log` in `.gitignore`) OR basic DB logging (create `LogEntry` model, migrate, use Prisma Client).
    *   **SAPPO Context:** Implement initial :LogPersistence (:FileBasedLogging or :DatabaseLogging :Pattern). Consider :ScalabilityBottleneck :Problem, plan for future enhancement.
    *   **Testing:** `tester-tdd` enhances **cumulative** integration test: Verify logs stored correctly (check file/DB).

21. **Task:** Create Client-Side Logging Utility (`utils/logger.ts`)
    *   **Mode:** `coder`
    *   **Action:** Implement `logger.ts` using `fetch` to send logs to `/api/logs/ingest`. Include console fallback error handling.
    *   **SAPPO Context:** Create :ClientSideLogging :Utility (:FacadePattern). Handles :APIInteraction, basic :ErrorHandling.
    *   **Testing:** `tester-tdd` adds **cumulative** unit tests for `logger` (mocking `fetch`).

22. **Task:** Integrate Client-Side Logger (Example Usage)
    *   **Mode:** `coder`
    *   **Action:** Import and use `logger` in example frontend code (e.g., component `useEffect`).
    *   **SAPPO Context:** Demonstrate practical application of :ClientSideLogging :Utility.
    *   **Testing:** Manually verify logs appear in storage during dev. `tester-tdd` might add E2E test later.