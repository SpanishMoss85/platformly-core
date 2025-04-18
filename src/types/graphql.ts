export interface GraphQLContext {
  user?: {
    id: string;
    role: string;
    orgId: string;
  };
  // Add more context fields as needed
}