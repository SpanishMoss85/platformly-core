# API Endpoints

This document summarizes the API endpoints for the application.

## Existing API Endpoints

*   `/api/graphql`: Handles GraphQL queries and mutations.
    *   `GET`: Handles GraphQL queries.
    *   `POST`: Handles GraphQL mutations.
*   `/api/auth/[...nextauth]`: Handles authentication-related requests using NextAuth.js.
    *   `GET`: Handles authentication-related requests.
    *   `POST`: Handles authentication-related requests.

## Inferred API Endpoints (Once Fully Implemented)

*   `/api/users`: Handles user-related operations.
    *   `POST`: Create a new user.
    *   `GET`: Get a list of users.
    *   `GET/:id`: Get a specific user by ID.
    *   `PUT/:id`: Update a specific user by ID.
    *   `DELETE/:id`: Delete a specific user by ID.
*   `/api/organizations`: Handles organization-related operations.
    *   `POST`: Create a new organization.
    *   `GET`: Get a list of organizations.
    *   `GET/:id`: Get a specific organization by ID.
    *   `PUT/:id`: Update a specific organization by ID.
    *   `DELETE/:id`: Delete a specific organization by ID.
*   `/api/roles`: Handles role-related operations.
    *   `POST`: Create a new role.
    *   `GET`: Get a list of roles.
    *   `GET/:id`: Get a specific role by ID.
    *   `PUT/:id`: Update a specific role by ID.
    *   `DELETE/:id`: Delete a specific role by ID.
*   `/api/permissions`: Handles permission-related operations.
    *   `POST`: Create a new permission.
    *   `GET`: Get a list of permissions.
    *   `GET/:id`: Get a specific permission by ID.
    *   `PUT/:id`: Update a specific permission by ID.
    *   `DELETE/:id`: Delete a specific permission by ID.
*   `/api/subscriptions`: Handles subscription-related operations.
    *   `POST`: Create a new subscription.
    *   `GET`: Get a list of subscriptions.
    *   `GET/:id`: Get a specific subscription by ID.
    *   `PUT/:id`: Update a specific subscription by ID.
    *   `DELETE/:id`: Delete a specific subscription by ID.
    `/api/apps`: Handles application-related operations.
    *   `POST`: Create a new application.
    *   `GET`: Get a list of applications.
    * `GET/:id`: Get a specific application by ID.
    *   `PUT/:id`: Update a specific application by ID.
    *   `DELETE/:id`: Delete a specific application by ID.