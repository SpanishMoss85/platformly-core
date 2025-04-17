# Phase 4, Task Group 1: Stripe Core Integration - Micro-Plan

**Goal:** Integrate Stripe for customer creation and basic subscription initiation. Establish foundational services and API routes for managing Stripe interactions.

**SAPPO Context:**
*   **:ArchitecturalPattern:** :ThirdPartyIntegration (Stripe), :ServiceLayer (for Stripe interactions), :APIGateway (Next.js API Routes).
*   **:ComponentRole:** `StripeService` (encapsulates Stripe SDK calls), API Route Handlers (expose Stripe functionality).
*   **:Technology:** `stripe` (Node.js SDK - specify version if critical later), Next.js API Routes, Prisma.
*   **:Problem Mitigation:** Mitigate :TightCoupling by isolating Stripe logic in a dedicated service. Address potential :ErrorHandling issues with robust error mapping from Stripe errors to application errors. Avoid :InsecureConfiguration by managing API keys via environment variables.

---

## Micro-Tasks:

**1. Stripe SDK Integration & Configuration:**
    *   **Task:** Add the official `stripe` Node.js library as a project dependency.
    *   **Specialist:** Coder
    *   **Input:** `package.json`
    *   **Output:** Updated `package.json` and `package-lock.json`.
    *   **SAPPO:** :DependencyManagement

**2. Stripe Service Initialization:**
    *   **Task:** Create a `StripeService` module/class. Initialize the Stripe client using the secret key from environment variables. Implement a configuration helper (`getConfig`) to securely load environment variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
    *   **Specialist:** Coder
    *   **Input:** Environment variable names (`STRIPE_SECRET_KEY`).
    *   **Output:** `services/stripeService.ts`, `utils/config.ts`.
    *   **SAPPO:** :ConfigurationManagement, :Security (API Key Handling), :ServiceLayer

**3. Stripe Customer Management Service Logic:**
    *   **Task:** Implement `getOrCreateStripeCustomer` function within `StripeService`. This function should:
        *   Accept an `organizationId`.
        *   Check if the `Organization` exists in Prisma and has a `stripeCustomerId`. Return if exists.
        *   If not, retrieve the organization owner's email.
        *   Call `stripe.customers.create` with organization name, owner email, and `organizationId` in metadata.
        *   Update the `Organization` record in Prisma with the new `stripeCustomerId`.
        *   Implement robust error handling using a `handleStripeError` utility (see step 5).
        *   Log the creation event using the `logger` utility.
    *   **Specialist:** Coder
    *   **Input:** `services/stripeService.ts`, Prisma schema (`Organization` model), `utils/logger.ts`.
    *   **Output:** Updated `services/stripeService.ts` with `getOrCreateStripeCustomer` function.
    *   **SAPPO:** :DataSynchronization (Local DB & Stripe), :ErrorHandling, :Auditing

**4. Stripe Error Handling Utility:**
    *   **Task:** Create a `handleStripeError` utility function. This function should:
        *   Accept the error object, a context string, and optional metadata.
        *   Log the error using the `logger`.
        *   Check if the error is a `Stripe.errors.StripeError`.
        *   Map specific Stripe error types (`StripeCardError`, `StripeInvalidRequestError`, etc.) to custom application error classes (e.g., `PaymentError`, `BadRequestError`, `InternalServerError`).
        *   Throw the mapped application error.
    *   **Specialist:** Coder
    *   **Input:** `utils/errors.ts` (for custom error classes), `utils/logger.ts`.
    *   **Output:** `utils/stripeErrorUtils.ts` (or similar) containing `handleStripeError`.
    *   **SAPPO:** :ErrorHandling, :AbstractionLayer (mapping external errors).

**5. API Route for Stripe Customer Creation (Internal/Admin):**
    *   **Task:** Create a Next.js API route (e.g., `/api/admin/stripe/create-customer`) that:
        *   Accepts an `organizationId`.
        *   Is protected by RBAC (e.g., requires `GOD_MODE` or specific admin permission).
        *   Calls the `getOrCreateStripeCustomer` service function.
        *   Returns the `stripeCustomerId`.
    *   **Specialist:** Coder
    *   **Input:** `services/stripeService.ts`, RBAC utilities (`withPermissions` or similar).
    *   **Output:** API route file (e.g., `pages/api/admin/stripe/create-customer.ts`).
    *   **SAPPO:** :APIDesign, :Security (Authorization).

**6. Subscription Creation Service Logic:**
    *   **Task:** Implement `createStripeSubscription` function within `StripeService`. This function should:
        *   Accept `organizationId`, `priceId`, and potentially `paymentMethodId` (or handle Setup Intents flow).
        *   Retrieve or create the `stripeCustomerId` using `getOrCreateStripeCustomer`.
        *   (If using Payment Method ID) Attach the payment method to the customer and set it as default.
        *   Call `stripe.subscriptions.create` with customer ID, price ID, `payment_behavior: 'default_incomplete'`, and metadata. Expand `latest_invoice.payment_intent`.
        *   Create a corresponding `Subscription` record in the local Prisma database, mapping the Stripe status (`mapStripeStatus` utility needed - see step 7) and storing relevant IDs and dates.
        *   Log the event.
        *   Handle potential payment intent actions required based on the expanded invoice/payment intent.
        *   Use `handleStripeError` for error handling.
        *   Return the local `Subscription` object.
    *   **Specialist:** Coder
    *   **Input:** `services/stripeService.ts`, Prisma schema (`Subscription` model).
    *   **Output:** Updated `services/stripeService.ts` with `createStripeSubscription` function.
    *   **SAPPO:** :DataSynchronization, :PaymentProcessing, :ErrorHandling, :StateManagement (mapping statuses).

**7. Stripe Status Mapping Utility:**
    *   **Task:** Create a `mapStripeStatus` utility function. This function should:
        *   Accept a Stripe subscription status string (`Stripe.Subscription.Status`).
        *   Return the corresponding local `SubscriptionStatus` enum value (defined in `schema.prisma`).
        *   Handle all relevant Stripe statuses (`active`, `trialing`, `past_due`, `canceled`, `unpaid`, `incomplete`, `incomplete_expired`).
    *   **Specialist:** Coder
    *   **Input:** Prisma `SubscriptionStatus` enum.
    *   **Output:** `utils/stripeStatusUtils.ts` (or similar) containing `mapStripeStatus`.
    *   **SAPPO:** :DataMapping, :StateManagement.

**8. API Route/GraphQL Mutation for Subscription Creation:**
    *   **Task:** Create a Next.js API route or GraphQL mutation (e.g., `/api/subscriptions/create` or `createSubscription` mutation) that:
        *   Accepts necessary input (e.g., `priceId`, potentially `paymentMethodId`).
        *   Authenticates the user and retrieves their `organizationId`.
        *   Performs necessary authorization checks (e.g., user role, existing subscriptions).
        *   Calls the `createStripeSubscription` service function.
        *   Returns the created local `Subscription` details and potentially information needed for client-side payment confirmation (like the payment intent client secret).
    *   **Specialist:** Coder
    *   **Input:** `services/stripeService.ts`, NextAuth.js session logic, RBAC utilities.
    *   **Output:** API route file or GraphQL resolver/mutation implementation.
    *   **SAPPO:** :APIDesign, :Security (Authentication, Authorization), :PaymentProcessing.

**9. Initial Stripe Integration Testing:**
    *   **Task:** Write unit/integration tests for:
        *   `StripeService` functions (`getOrCreateStripeCustomer`, `createStripeSubscription`), mocking Stripe SDK calls and Prisma.
        *   `handleStripeError` utility.
        *   `mapStripeStatus` utility.
        *   API routes/mutations, mocking service layer dependencies.
    *   **Specialist:** Tester
    *   **Input:** Code from previous steps, testing framework (Jest/Vitest).
    *   **Output:** Test files covering the implemented logic.
    *   **SAPPO:** :Testing (Unit, Integration), :Mocking.

**10. Documentation Update:**
    *   **Task:** Update relevant documentation (`README.md`, API docs) to reflect the new Stripe integration setup, required environment variables (`STRIPE_SECRET_KEY`), and basic usage of the new API endpoints/mutations.
    *   **Specialist:** Docs Writer
    *   **Input:** Code, environment variable details.
    *   **Output:** Updated documentation files.
    *   **SAPPO:** :Documentation.

---
**Next Step:** Phase 4, Task Group 2: Subscription Lifecycle & Webhooks.