# Phase 4, Task Group 1: Stripe Core Integration - Micro-Plan

**Goal:** Integrate Stripe for customer creation and basic subscription initiation. Establish foundational services and API routes for managing Stripe interactions.

**SAPPO Context:**

- **:ArchitecturalPattern:** :ThirdPartyIntegration (Stripe), :ServiceLayer (for Stripe interactions), :APIGateway (Next.js API Routes).
- **:ComponentRole:** `StripeService` (encapsulates Stripe SDK calls), API Route Handlers (expose Stripe functionality).
- **:Technology:** `stripe` (Node.js SDK - specify version if critical later), Next.js API Routes, Prisma.
- **:Problem Mitigation:** Mitigate :TightCoupling by isolating Stripe logic in a dedicated service. Address potential :ErrorHandling issues with robust error mapping from Stripe errors to application errors. Avoid :InsecureConfiguration by managing API keys via environment variables.

---

## Micro-Tasks:

**1. Stripe SDK Integration & Configuration:**
_ **Task:** Add the official `stripe` Node.js library as a project dependency.
_ **Specialist:** Coder
_ **Input:** `package.json`
_ **Output:** Updated `package.json` and `package-lock.json`. \* **SAPPO:** :DependencyManagement

**2. Stripe Service Initialization:**
_ **Task:** Create a `StripeService` module/class. Initialize the Stripe client using the secret key from environment variables. Implement a configuration helper (`getConfig`) to securely load environment variables (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
_ **Specialist:** Coder
_ **Input:** Environment variable names (`STRIPE_SECRET_KEY`).
_ **Output:** `services/stripeService.ts`, `utils/config.ts`. \* **SAPPO:** :ConfigurationManagement, :Security (API Key Handling), :ServiceLayer

**3. Stripe Customer Management Service Logic:**
_ **Task:** Implement `getOrCreateStripeCustomer` function within `StripeService`. This function should:
_ Accept an `organizationId`.
_ Check if the `Organization` exists in Prisma and has a `stripeCustomerId`. Return if exists.
_ If not, retrieve the organization owner's email.
_ Call `stripe.customers.create` with organization name, owner email, and `organizationId` in metadata.
_ Update the `Organization` record in Prisma with the new `stripeCustomerId`.
_ Implement robust error handling using a `handleStripeError` utility (see step 5).
_ Log the creation event using the `logger` utility.
_ **Specialist:** Coder
_ **Input:** `services/stripeService.ts`, Prisma schema (`Organization` model), `utils/logger.ts`.
_ **Output:** Updated `services/stripeService.ts` with `getOrCreateStripeCustomer` function.
_ **SAPPO:** :DataSynchronization (Local DB & Stripe), :ErrorHandling, :Auditing

**4. Stripe Error Handling Utility:**
_ **Task:** Create a `handleStripeError` utility function. This function should:
_ Accept the error object, a context string, and optional metadata.
_ Log the error using the `logger`.
_ Check if the error is a `Stripe.errors.StripeError`.
_ Map specific Stripe error types (`StripeCardError`, `StripeInvalidRequestError`, etc.) to custom application error classes (e.g., `PaymentError`, `BadRequestError`, `InternalServerError`).
_ Throw the mapped application error.
_ **Specialist:** Coder
_ **Input:** `utils/errors.ts` (for custom error classes), `utils/logger.ts`.
_ **Output:** `utils/stripeErrorUtils.ts` (or similar) containing `handleStripeError`.
_ **SAPPO:** :ErrorHandling, :AbstractionLayer (mapping external errors).

**5. API Route for Stripe Customer Creation (Internal/Admin):**
_ **Task:** Create a Next.js API route (e.g., `/api/admin/stripe/create-customer`) that:
_ Accepts an `organizationId`.
_ Is protected by RBAC (e.g., requires `GOD_MODE` or specific admin permission).
_ Calls the `getOrCreateStripeCustomer` service function.
_ Returns the `stripeCustomerId`.
_ **Specialist:** Coder
_ **Input:** `services/stripeService.ts`, RBAC utilities (`withPermissions` or similar).
_ **Output:** API route file (e.g., `pages/api/admin/stripe/create-customer.ts`). \* **SAPPO:** :APIDesign, :Security (Authorization).

**6. Subscription Creation Service Logic:**
_ **Task:** Implement `createStripeSubscription` function within `StripeService`. This function should:
_ Accept `organizationId`, `priceId`, and potentially `paymentMethodId` (or handle Setup Intents flow).
_ Retrieve or create the `stripeCustomerId` using `getOrCreateStripeCustomer`.
_ (If using Payment Method ID) Attach the payment method to the customer and set it as default.
_ Call `stripe.subscriptions.create` with customer ID, price ID, `payment_behavior: 'default_incomplete'`, and metadata. Expand `latest_invoice.payment_intent`.
_ Create a corresponding `Subscription` record in the local Prisma database, mapping the Stripe status (`mapStripeStatus` utility needed - see step 7) and storing relevant IDs and dates.
_ Log the event.
_ Handle potential payment intent actions required based on the expanded invoice/payment intent.
_ Use `handleStripeError` for error handling.
_ Return the local `Subscription` object.
_ **Specialist:** Coder
_ **Input:** `services/stripeService.ts`, Prisma schema (`Subscription` model).
_ **Output:** Updated `services/stripeService.ts` with `createStripeSubscription` function.
_ **SAPPO:** :DataSynchronization, :PaymentProcessing, :ErrorHandling, :StateManagement (mapping statuses).

**7. Stripe Status Mapping Utility:**
_ **Task:** Create a `mapStripeStatus` utility function. This function should:
_ Accept a Stripe subscription status string (`Stripe.Subscription.Status`).
_ Return the corresponding local `SubscriptionStatus` enum value (defined in `schema.prisma`).
_ Handle all relevant Stripe statuses (`active`, `trialing`, `past_due`, `canceled`, `unpaid`, `incomplete`, `incomplete_expired`).
_ **Specialist:** Coder
_ **Input:** Prisma `SubscriptionStatus` enum.
_ **Output:** `utils/stripeStatusUtils.ts` (or similar) containing `mapStripeStatus`.
_ **SAPPO:** :DataMapping, :StateManagement.

**8. API Route/GraphQL Mutation for Subscription Creation:**
_ **Task:** Create a Next.js API route or GraphQL mutation (e.g., `/api/subscriptions/create` or `createSubscription` mutation) that:
_ Accepts necessary input (e.g., `priceId`, potentially `paymentMethodId`).
_ Authenticates the user and retrieves their `organizationId`.
_ Performs necessary authorization checks (e.g., user role, existing subscriptions).
_ Calls the `createStripeSubscription` service function.
_ Returns the created local `Subscription` details and potentially information needed for client-side payment confirmation (like the payment intent client secret).
_ **Specialist:** Coder
_ **Input:** `services/stripeService.ts`, NextAuth.js session logic, RBAC utilities.
_ **Output:** API route file or GraphQL resolver/mutation implementation.
_ **SAPPO:** :APIDesign, :Security (Authentication, Authorization), :PaymentProcessing.

**9. Initial Stripe Integration Testing:**
_ **Task:** Write unit/integration tests for:
_ `StripeService` functions (`getOrCreateStripeCustomer`, `createStripeSubscription`), mocking Stripe SDK calls and Prisma.
_ `handleStripeError` utility.
_ `mapStripeStatus` utility.
_ API routes/mutations, mocking service layer dependencies.
_ **Specialist:** Tester
_ **Input:** Code from previous steps, testing framework (Jest/Vitest).
_ **Output:** Test files covering the implemented logic. \* **SAPPO:** :Testing (Unit, Integration), :Mocking.

**10. Documentation Update:**
_ **Task:** Update relevant documentation (`README.md`, API docs) to reflect the new Stripe integration setup, required environment variables (`STRIPE_SECRET_KEY`), and basic usage of the new API endpoints/mutations.
_ **Specialist:** Docs Writer
_ **Input:** Code, environment variable details.
_ **Output:** Updated documentation files. \* **SAPPO:** :Documentation.

---

**Next Step:** Phase 4, Task Group 2: Subscription Lifecycle & Webhooks.
