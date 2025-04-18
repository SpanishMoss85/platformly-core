# Phase 4, Task Group 2: Subscription Lifecycle & Webhooks - Micro-Plan

**Goal:** Implement Stripe webhook handling to keep local subscription data synchronized with Stripe events and manage the subscription lifecycle (updates, cancellations, payment status changes).

**SAPPO Context:**

- **:ArchitecturalPattern:** :EventDrivenArchitecture (Webhook handling), :ThirdPartyIntegration (Stripe), :DataSynchronization.
- **:ComponentRole:** `StripeWebhookHandler` (API Route), `SubscriptionUpdateService` (logic to update local DB based on events).
- **:Technology:** Stripe Webhooks, Next.js API Routes, Prisma, `stripe` SDK, `micro` (for raw body parsing).
- **:Problem Mitigation:** Address :DataConsistency issues by reliably processing webhooks and updating local state. Mitigate :SecurityVulnerability by verifying webhook signatures. Handle :Idempotency issues in webhook processing to prevent duplicate updates. Manage potential :ScalabilityBottleneck in webhook handler by keeping processing lightweight and potentially deferring heavy tasks.

---

## Micro-Tasks:

**1. Stripe Webhook API Route Setup:**
_ **Task:** Create a Next.js API route (e.g., `/api/webhooks/stripe`) specifically for receiving Stripe webhooks.
_ Disable Next.js default body parsing for this route to access the raw request body.
_ Retrieve the `stripe-signature` header.
_ Use the `buffer` utility (from `micro` or similar) to read the raw request body.
_ **Specialist:** Coder
_ **Input:** Next.js project structure.
_ **Output:** API route file (`pages/api/webhooks/stripe.ts` or `app/api/webhooks/stripe/route.ts`) with initial setup and raw body reading.
_ **SAPPO:** :APIDesign, :ConfigurationManagement.

**2. Webhook Signature Verification:**
_ **Task:** Implement webhook signature verification within the API route using `stripe.webhooks.constructEvent`.
_ Use the raw body buffer, the `stripe-signature` header, and the `STRIPE_WEBHOOK_SECRET` environment variable.
_ Handle potential errors during verification (invalid signature, timestamp mismatch) and return appropriate HTTP status codes (e.g., 400).
_ Log verification success or failure.
_ **Specialist:** Coder
_ **Input:** API route file, `stripe` SDK, `STRIPE_WEBHOOK_SECRET` environment variable, `utils/logger.ts`.
_ **Output:** Updated API route with robust signature verification logic.
_ **SAPPO:** :Security (Webhook Verification), :ErrorHandling, :Auditing.

**3. Webhook Event Dispatcher:**
_ **Task:** Implement a `switch` statement or similar dispatch mechanism within the verified webhook handler to route different `event.type` values to specific handler functions.
_ Log the received event type and ID.
_ Initially handle key events: `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. Add stubs for handler functions.
_ Ensure a 200 OK response is sent back to Stripe promptly after acknowledging the event (even if processing is deferred).
_ **Specialist:** Coder
_ **Input:** API route file, Stripe event types list.
_ **Output:** Updated API route with event dispatch logic and stubs for handlers.
_ **SAPPO:** :EventHandling, :ControlFlow.

**4. Subscription Update Webhook Handler Logic:**
_ **Task:** Create and implement the `handleSubscriptionUpdated` function (e.g., in `services/stripeWebhookHandlers.ts`). This function should:
_ Accept a `Stripe.Subscription` object.
_ Find the corresponding local `Subscription` record using `stripeSubscriptionId`.
_ Update the local record's status (using `mapStripeStatus`), `endDate`, `startDate`, `stripePriceId`, etc., based on the received Stripe subscription data.
_ Handle potential race conditions or ensure idempotency (e.g., check if the update is newer than the existing record's last update timestamp).
_ Log the update action.
_ **Specialist:** Coder
_ **Input:** Stripe `Subscription` object structure, Prisma schema (`Subscription`), `utils/stripeStatusUtils.ts`, `utils/logger.ts`.
_ **Output:** `services/stripeWebhookHandlers.ts` with `handleSubscriptionUpdated` implementation.
_ **SAPPO:** :DataSynchronization, :StateManagement, :Idempotency.

**5. Subscription Cancellation Webhook Handler Logic:**
_ **Task:** Create and implement the `handleSubscriptionCanceled` function. This function should:
_ Accept a `Stripe.Subscription` object.
_ Find the corresponding local `Subscription` record.
_ Update the local record's status to `CANCELED` (or equivalent) and potentially set the `endDate`.
_ Log the cancellation.
_ **Specialist:** Coder
_ **Input:** Stripe `Subscription` object structure, Prisma schema (`Subscription`), `utils/logger.ts`.
_ **Output:** `services/stripeWebhookHandlers.ts` with `handleSubscriptionCanceled` implementation. \* **SAPPO:** :DataSynchronization, :StateManagement.

**6. Invoice Payment Success/Failure Handler Logic:**
_ **Task:** Create and implement `handlePaymentSucceeded` and `handlePaymentFailed` functions. These functions should:
_ Accept a `Stripe.Invoice` object.
_ Retrieve the `stripeSubscriptionId` from the invoice.
_ Find the corresponding local `Subscription` record.
_ Update the local subscription status based on the payment outcome (e.g., `ACTIVE` on success, `PAST_DUE` or `UNPAID` on failure). This might overlap with `customer.subscription.updated`, so ensure logic is consistent or primarily driven by subscription events.
_ Potentially trigger user notifications (e.g., payment confirmation, failure notice) via an email service (like SendGrid).
_ Log the payment event.
_ **Specialist:** Coder
_ **Input:** Stripe `Invoice` object structure, Prisma schema (`Subscription`), `utils/logger.ts`, Email service integration (optional).
_ **Output:** `services/stripeWebhookHandlers.ts` with payment event handlers. \* **SAPPO:** :DataSynchronization, :StateManagement, :Notification, :ErrorHandling.

**7. Enhance Authorization Logic with Subscription Status:**
_ **Task:** Modify the `getAuthorizedLaunchUrlLogic` (from Phase 1, Task Group 2) and any other relevant permission checks (`hasPermission`, API guards) to strictly check the local `Subscription.status`.
_ Ensure only users belonging to organizations with `ACTIVE` or `TRIALING` subscriptions can access protected resources or launch applications requiring a subscription.
_ **Specialist:** Coder
_ **Input:** `services/appLaunch.ts`, `utils/permissions.ts`, API route middleware/guards.
_ **Output:** Updated authorization logic incorporating subscription status checks.
_ **SAPPO:** :Authorization, :BusinessLogic.

**8. User Notification Implementation (Basic):**
_ **Task:** Implement basic user notifications triggered by webhook handlers (e.g., payment failure, subscription cancellation).
_ Integrate an email service (e.g., SendGrid) if not already done.
_ Create utility functions to send templated emails for specific events.
_ Call these notification functions from the relevant webhook handlers (`handlePaymentFailed`, `handleSubscriptionCanceled`, etc.).
_ **Specialist:** Coder
_ **Input:** Webhook handler functions, Email service credentials/SDK.
_ **Output:** Email sending utilities, updated webhook handlers calling notifications.
_ **SAPPO:** :Notification, :ThirdPartyIntegration.

**9. Webhook Handling Testing:**
_ **Task:** Write unit/integration tests for:
_ Webhook signature verification logic (mocking headers/body).
_ Individual webhook handler functions (`handleSubscriptionUpdated`, etc.), mocking Prisma and Stripe objects.
_ End-to-end testing using the Stripe CLI (`stripe listen --forward-to <local_webhook_url>`) to simulate real events and verify database updates and application behavior (e.g., access restriction changes).
_ **Specialist:** Tester
_ **Input:** Code from previous steps, Stripe CLI, testing framework.
_ **Output:** Test files, Stripe CLI test procedures.
_ **SAPPO:** :Testing (Unit, Integration, EndToEnd), :Mocking, :ThirdPartyTooling (Stripe CLI).

**10. Documentation Update:**
_ **Task:** Document the Stripe webhook endpoint, the events handled, the required environment variable (`STRIPE_WEBHOOK_SECRET`), and the local testing procedure using the Stripe CLI.
_ **Specialist:** Docs Writer
_ **Input:** Webhook implementation details, Stripe CLI usage.
_ **Output:** Updated `README.md` or relevant API documentation. \* **SAPPO:** :Documentation.

---

**Next Step:** Phase 5: Advanced Security & System Finalization.
