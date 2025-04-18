# Platformly Core

This repository contains the core backend and frontend services for the Platformly application, built using the Next.js framework. It follows a modular :ArchitecturalPattern designed for scalability and maintainability.

## SAPPO Context

This documentation serves as essential :ProjectDocumentation and :ConfigurationGuidance, crucial for successful :Onboarding of new developers and enhancing the overall :DeveloperExperience.

*   **:ProjectContext**: This is a Next.js application, leveraging its full-stack capabilities for both API routes and server-rendered/client-side pages.
*   **:TechnologyVersion**: Key technologies include Next.js (version specified in `package.json`), Node.js (version recommended in documentation or `.nvmrc`), and Prisma for database interaction.
*   **:EnvironmentContext**: The application is designed to run in various environments (development, staging, production), requiring specific environment variables detailed in the `.env.example` file.

## Setup Instructions

To get the project up and running locally, follow these steps:

1.  **Prerequisites**: Ensure you have Node.js (use the version specified in `.nvmrc` if present), npm/yarn/pnpm/bun, and a PostgreSQL database server installed and running.
2.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd platformly-core
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```
4.  **Environment Variables**: Create a `.env` file in the root directory by copying the `.env.example` file.
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file and fill in the required values for your local environment.
5.  **Database Setup**: Apply the database migrations using Prisma.
    ```bash
    npx prisma migrate dev --name init
    ```
    If you need to seed the database with initial data:
    ```bash
    npx prisma db seed
    ```

## Running the Application

To run the application in development mode:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

The application will be accessible at `http://localhost:3000`.

## Testing Strategy

Proper setup as described above is essential for running the project's test suite. The project employs a dual testing strategy:

*   **Cumulative Testing**: All tests are run together to ensure system-wide stability and catch regressions as new features are added or changes are made.
*   **Recursive Testing**: (If applicable to specific components, e.g., tree traversal algorithms) Dedicated tests are included to verify recursive functions, covering base cases, recursive steps, and edge cases to prevent potential :Problems like :StackOverflowError or incorrect logic in recursive calls.

Running the full test suite:

```bash
npm test
# or
yarn test
# or
pnpm test
# or
bun test
```

## Learn More

*   [Next.js Documentation](https://nextjs.org/docs)
*   [Prisma Documentation](https://www.prisma.io/docs/)
*   [NextAuth.js Documentation](https://next-auth.js.org/documentation)
