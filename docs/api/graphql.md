# GraphQL API Documentation (`/api/graphql`)

This document provides details about the GraphQL API endpoint available at `/api/graphql`. It covers the schema, authentication, rate limiting, and relevant architectural concepts.

## SAPPO Context

*   **:ArchitecturalPattern:** This endpoint implements a standard **GraphQL API** pattern. It provides a single endpoint where clients can request exactly the data they need using a defined schema. This is **not** a `:RecursiveAlgorithm`. Data fetching involves resolving fields, which might fetch related data (e.g., fetching a `User`'s `Organization`), but this is data graph traversal, not algorithmic recursion in the traditional sense.
*   **:Technology choices:**
    *   **Apollo Server (`@apollo/server`):** A widely adopted library for building GraphQL servers, providing robust features and compatibility with the GraphQL specification (:TechnologyVersion - Check `package.json`). Chosen for its maturity and integration capabilities.
    *   **Next.js Route Handlers:** The API is implemented as a Next.js Route Handler (`src/app/api/graphql/route.ts`), integrating seamlessly with the Next.js framework (:TechnologyVersion - Check `package.json`).
    *   **Prisma (`@prisma/client`):** Used as the Object-Relational Mapper (ORM) for database interactions, simplifying data access and ensuring type safety (:TechnologyVersion - Check `package.json`).
    *   **NextAuth.js (`next-auth`):** Handles authentication, ensuring only logged-in users can access the API (:TechnologyVersion - Check `package.json`).
    *   **Upstash Redis/Ratelimit (`@upstash/redis`, `@upstash/ratelimit`):** Implements serverless rate limiting to protect the API from abuse (:TechnologyVersion - Check `package.json`). Chosen for its ease of use in serverless environments.
    *   **Zod (`zod`):** Used for input validation in certain mutations (e.g., `updateUserProfile`, `updateOrganization`), enhancing robustness (:TechnologyVersion - Check `package.json`).
*   **:Context:**
    *   **:EnvironmentContext:** This API runs within a Next.js serverless function environment.
    *   **:ProjectContext:** This API serves as the primary data access layer for the Platformly Core frontend or other authorized clients.
*   **Potential :Problems:**
    *   **:PerformanceIssues:** Complex GraphQL queries requesting deeply nested data or large lists could potentially lead to performance bottlenecks. Careful query design and resolver optimization are necessary.
    *   **:Authorization:** While authentication is handled by NextAuth.js, fine-grained authorization (ensuring users can only access/modify data they are permitted to) is implemented within the resolvers (e.g., checking `context.session.user.id` in `updateUserProfile`). This requires careful implementation to prevent security vulnerabilities.
    *   **:RateLimiting:** The API is rate-limited (5 requests per minute per IP). Clients exceeding this limit will receive a `429 Too Many Requests` error.

## Authentication

All requests to this GraphQL endpoint require authentication. The server uses `next-auth/next`'s `getServerSession()` to retrieve the user's session. If no valid session is found, an "Unauthorized" error is thrown. Authentication is typically handled via session cookies or bearer tokens managed by NextAuth.js.

## Rate Limiting

The API employs rate limiting using Upstash Ratelimit with Redis.
*   **Limit:** 5 requests per 1-minute sliding window per IP address.
*   **Headers:** Successful responses and `429` error responses include the following headers:
    *   `X-RateLimit-Limit`: The maximum number of requests allowed in the window (5).
    *   `X-RateLimit-Remaining`: The number of requests remaining in the current window.
    *   `X-RateLimit-Reset`: A Unix timestamp indicating when the rate limit window resets.

## Schema

The API supports both `GET` and `POST` requests. `POST` requests should send the GraphQL query/mutation in the request body (JSON or raw string).

### Types

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  organization: Organization
  role: Role
}

type Organization {
  id: ID!
  name: String!
  users: [User]
}

type Role {
  id: ID!
  name: String!
  users: [User]
}

type Application {
  id: ID!
  name: String!
  enabled: Boolean!
}
```

### Queries

```graphql
type Query {
  # Fetches all users (requires authentication)
  users: [User]

  # Fetches a specific user by ID (requires authentication)
  user(id: ID!): User

  # Fetches all organizations (requires authentication)
  organizations: [Organization]

  # Fetches a specific organization by ID (requires authentication)
  organization(id: ID!): Organization

  # Fetches the organization associated with the authenticated user (requires authentication)
  myOrganization: Organization

  # Fetches all roles (requires authentication)
  roles: [Role]

  # Fetches a specific role by ID (requires authentication)
  role(id: ID!): Role

  # Fetches all enabled applications (requires authentication)
  applications: [Application]
}
```

**Example Query:**

```graphql
query GetMyOrgUsers {
  myOrganization {
    id
    name
    users {
      id
      name
      email
    }
  }
}
```

### Mutations

```graphql
type Mutation {
  # Creates a new user (requires authentication, currently returns null)
  createUser(name: String!, email: String!, organizationId: ID!, roleId: ID!): User

  # Updates an existing user (requires authentication, implementation may be partial)
  updateUser(id: ID!, name: String, email: String, organizationId: ID, roleId: ID): User

  # Deletes a user (requires authentication, currently returns false)
  deleteUser(id: ID!): Boolean

  # Creates a new organization (requires authentication, currently returns null)
  createOrganization(name: String!): Organization

  # Updates an existing organization (requires authentication, user must belong to the org)
  # Validates input using Zod.
  updateOrganization(id: ID!, name: String): Organization

  # Deletes an organization (requires authentication, currently returns false)
  deleteOrganization(id: ID!): Boolean

  # Creates a new role (requires authentication, currently returns null)
  createRole(name: String!): Role

  # Updates an existing role (requires authentication, currently returns null)
  updateRole(id: ID!, name: String): Role

  # Deletes a role (requires authentication, currently returns false)
  deleteRole(id: ID!): Boolean

  # Updates the authenticated user's profile (name/email)
  # Requires authentication, user can only update their own profile.
  # Validates input using Zod.
  updateUserProfile(id: ID!, name: String, email: String): User

  # Gets an authorized launch URL for a specific application
  # Requires authentication and valid subscription/permissions.
  getAuthorizedLaunchUrl(applicationId: ID!): String
}
```

**Example Mutation:**

```graphql
mutation UpdateMyProfileName {
  updateUserProfile(id: "user-uuid-here", name: "New Name") {
    id
    name
    email
  }
}
```

## Testing Strategy

Testing for this GraphQL API endpoint is crucial for ensuring its correctness and stability within the larger application.

*   **CUMULATIVE TESTING:**
    *   **Contribution:** Integration tests specifically targeting this `/api/graphql` endpoint (likely using tools like Jest with Supertest or Apollo Client testing utilities) form part of the project's cumulative test suite. These tests verify the behavior of individual queries and mutations, including authentication and authorization logic.
    *   **Dependency:** When running tests for this API, relevant unit tests for services it depends on (e.g., `getAuthorizedLaunchUrl` service) should also pass.
    *   **System Stability:** Running the *entire* test suite, including these API tests alongside all other backend and frontend tests, ensures that changes to the API do not negatively impact other parts of the Platformly Core application, and vice-versa. This confirms overall system integrity after changes.

*   **RECURSIVE TESTING:**
    *   This strategy is **not applicable** to this specific API implementation, as it does not contain any inherently recursive algorithms. The data fetching involves graph traversal based on the schema, but not recursive function calls in the algorithmic sense that would require dedicated base case and recursive step testing.