'use client';
import { useEffect, useRef, useState } from 'react';
import logger from '@/utils/logger';
import mermaid from 'mermaid';

export default function Home() {
  // Create refs for the diagram containers
  const typeRelationshipsRef = useRef<HTMLDivElement>(null);
  const operationsMapRef = useRef<HTMLDivElement>(null);
  const schemaRelationsRef = useRef<HTMLDivElement>(null);

  // Track active tab in the schema section
  const [activeTab, setActiveTab] = useState('query');

  // Initialize mermaid and render diagrams on mount
  useEffect(() => {
    logger.info('Home component mounted');

    // Initialize mermaid with configuration
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });

    // Render diagrams after component mounts
    if (typeRelationshipsRef.current && operationsMapRef.current && schemaRelationsRef.current) {
      try {
        // Clear previous renders
        typeRelationshipsRef.current.innerHTML = '';
        operationsMapRef.current.innerHTML = '';
        schemaRelationsRef.current.innerHTML = '';

        // Render type relationships diagram
        mermaid
          .render(
            'type-relationships-diagram',
            `
          graph TD
            User[User] -- belongs to --> Org[Organization]
            User -- has --> Role[Role]
            Org -- has many --> User
            Role -- assigned to many --> User
            App[Application] -- accessible by --> User
        `
          )
          .then(({ svg }) => {
            if (typeRelationshipsRef.current) {
              typeRelationshipsRef.current.innerHTML = svg;
            }
          });

        // Render operations map diagram
        mermaid
          .render(
            'operations-map-diagram',
            `
          graph LR
            Client[Client] -- Queries --> Q[Queries]
            Client -- Mutations --> M[Mutations]
            Q -- "users, user(id)" --> User[User]
            Q -- "organizations, organization(id), myOrganization" --> Org[Organization]
            Q -- "roles, role(id)" --> Role[Role]
            Q -- "applications" --> App[Application]
            M -- "createUser, updateUser, deleteUser, updateUserProfile" --> User
            M -- "createOrganization, updateOrganization, deleteOrganization" --> Org
            M -- "createRole, updateRole, deleteRole" --> Role
            M -- "getAuthorizedLaunchUrl" --> App
        `
          )
          .then(({ svg }) => {
            if (operationsMapRef.current) {
              operationsMapRef.current.innerHTML = svg;
            }
          });

        // Render schema relations diagram
        mermaid
          .render(
            'schema-relations-diagram',
            `
          graph TD
            subgraph "GraphQL Schema Structure"
              Query[Query] --> User
              Query --> Organization
              Query --> Role
              Query --> Application
              Mutation[Mutation] --> User
              Mutation --> Organization
              Mutation --> Role
              Mutation --> Application

              class User,Organization,Role,Application type;
              class Query,Mutation operation;
            end

            classDef type fill:#f9a825,stroke:#f57f17,stroke-width:2px,color:black;
            classDef operation fill:#1e88e5,stroke:#0d47a1,stroke-width:2px,color:white;
        `
          )
          .then(({ svg }) => {
            if (schemaRelationsRef.current) {
              schemaRelationsRef.current.innerHTML = svg;
            }
          });
      } catch (error) {
        console.error('Error rendering mermaid diagrams:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Platformly Core Developer Portal</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">API Documentation & System Status</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Diagrams Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Type Relationships</h2>

          {/* Diagram container with ref */}
          <div ref={typeRelationshipsRef} className="mermaid-diagram overflow-auto">
            {/* Diagram will be rendered here */}
            <div className="text-center text-gray-500">Loading diagram...</div>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4 border-b pb-2">API Operations Map</h2>

          {/* Diagram container with ref */}
          <div ref={operationsMapRef} className="mermaid-diagram overflow-auto">
            {/* Diagram will be rendered here */}
            <div className="text-center text-gray-500">Loading diagram...</div>
          </div>
        </section>

        {/* API Info Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">API Information</h2>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Authentication & Rate Limiting</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                🔒 <strong>All operations require authentication</strong> via NextAuth
              </li>
              <li>
                ⏱️ <strong>Rate limit</strong>: 5 requests per minute per IP
              </li>
              <li>🔄 Rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Object Types Overview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="p-2 border border-gray-300 dark:border-gray-600">Type</th>
                    <th className="p-2 border border-gray-300 dark:border-gray-600">Fields</th>
                    <th className="p-2 border border-gray-300 dark:border-gray-600">Relationships</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">User</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">id, name, email</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">
                      belongs to Organization, has Role
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">Organization</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">id, name</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">has many Users</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">Role</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">id, name</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">assigned to many Users</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">Application</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">id, name, enabled</td>
                    <td className="p-2 border border-gray-300 dark:border-gray-600">accessible by Users</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Endpoint</h3>
            <code className="bg-gray-100 dark:bg-gray-700 p-2 rounded block">/api/graphql</code>
          </div>
        </section>

        {/* Enhanced Schema Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">GraphQL Schema</h2>

          {/* Schema visualization */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Schema Structure</h3>
            <div ref={schemaRelationsRef} className="mermaid-diagram overflow-auto">
              <div className="text-center text-gray-500">Loading schema diagram...</div>
            </div>
          </div>

          {/* Schema tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-300 dark:border-gray-700 mb-4">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'query' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('query')}
              >
                Queries
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'mutation' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('mutation')}
              >
                Mutations
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'example' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('example')}
              >
                Examples
              </button>
            </div>

            {activeTab === 'query' && (
              <div className="schema-content">
                <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Available Queries</h4>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto text-sm">
                  <code className="text-blue-800 dark:text-blue-300 font-bold">type Query </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">users</span>: [User]
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">user</span>(id: ID!): User
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">organizations</span>: [Organization]
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">organization</span>(id: ID!): Organization
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">myOrganization</span>: Organization
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">roles</span>: [Role]
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">role</span>(id: ID!): Role
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">applications</span>: [Application]
                  </code>
                  <code className="text-blue-800 dark:text-blue-300 font-bold"></code>
                </pre>
              </div>
            )}

            {activeTab === 'mutation' && (
              <div className="schema-content">
                <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">Available Mutations</h4>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto text-sm">
                  <code className="text-green-800 dark:text-green-300 font-bold">type Mutation </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">createUser</span>(name: String!, email:
                    String!, organizationId: ID!, roleId: ID!): User
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">updateUser</span>(id: ID!, name: String,
                    email: String, organizationId: ID, roleId: ID): User
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">deleteUser</span>(id: ID!): Boolean
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">updateUserProfile</span>(id: ID!, name:
                    String, email: String): User
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">createOrganization</span>(name: String!):
                    Organization
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">updateOrganization</span>(id: ID!, name:
                    String): Organization
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">deleteOrganization</span>(id: ID!): Boolean
                  </code>
                  <code className="block pl-4">
                    <span className="text-purple-600 dark:text-purple-400">getAuthorizedLaunchUrl</span>(applicationId:
                    ID!): String
                  </code>
                  <code className="text-green-800 dark:text-green-300 font-bold"></code>
                </pre>
              </div>
            )}

            {activeTab === 'example' && (
              <div className="schema-content">
                <h4 className="font-medium mb-2 text-amber-600 dark:text-amber-400">Example Queries</h4>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Get My Organization Users</span>
                    <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                      Query
                    </span>
                  </div>
                  <pre className="overflow-x-auto text-sm">
                    <code className="text-gray-800 dark:text-gray-300">
                      {`query GetMyOrgUsers {
  myOrganization {
    id
    name
    users {
      id
      name
      email
    }
  }
}`}
                    </code>
                  </pre>
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Update User Profile</span>
                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                      Mutation
                    </span>
                  </div>
                  <pre className="overflow-x-auto text-sm">
                    <code className="text-gray-800 dark:text-gray-300">
                      {`mutation UpdateMyProfileName {
  updateUserProfile(
    id: "user-uuid-here"
    name: "New Name"
  ) {
    id
    name
    email
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900 rounded">
            <h4 className="font-medium mb-1">GraphQL Endpoint Testing</h4>
            <p className="text-sm mb-2">Try out the API by sending a request to:</p>
            <div className="flex items-center">
              <code className="bg-white dark:bg-gray-800 p-2 rounded block flex-1">/api/graphql</code>
              <button className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Explore API
              </button>
            </div>
          </div>
        </section>

        {/* Test Status Section */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Testing Status</h2>

          <div className="space-y-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded">
              <h3 className="font-semibold">Unit Tests</h3>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="ml-2 font-medium">92%</span>
              </div>
            </div>

            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded">
              <h3 className="font-semibold">Integration Tests</h3>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <span className="ml-2 font-medium">67%</span>
              </div>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                Blocked: Need to fix Prisma-related test issues
              </p>
            </div>

            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded">
              <h3 className="font-semibold">Current Phase: Phase 2 - RBAC & Enhanced Authentication</h3>
              <p className="mt-1 text-sm">
                <span className="font-medium">In Progress:</span> Role-Based Access Control and Permissions
              </p>
            </div>

            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded">
              <h3 className="font-semibold">Testing Strategy</h3>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>
                  <strong>CUMULATIVE TESTING:</strong> Integration tests for all API endpoints
                </li>
                <li>
                  <strong>RECURSIVE TESTING:</strong> N/A (No recursive algorithms identified)
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Platformly Core • Developer Documentation</p>
        <p className="mt-1">Next steps: Complete Phase 2 Task Group 1 - Feature Flag & Permissions System</p>
      </footer>
    </div>
  );
}
