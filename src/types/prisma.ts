// src/types/prisma.ts

// Define the mock interface for Prisma Client
export interface PrismaMock {
  user: Record<string, jest.Mock>;
  organization: Record<string, jest.Mock>;
  role: Record<string, jest.Mock>;
  permission: Record<string, jest.Mock>;
  rolePermission: Record<string, jest.Mock>;
  application: Record<string, jest.Mock>;
  organizationApplication: Record<string, jest.Mock>;
  subscription: Record<string, jest.Mock>;
  account: Record<string, jest.Mock>;
  session: Record<string, jest.Mock>;
  verificationToken: Record<string, jest.Mock>;
  $transaction: jest.Mock;
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $executeRawUnsafe: jest.Mock;
  $queryRawUnsafe: jest.Mock;
}

// Define the mock interface for Prisma Adapter
export interface PrismaAdapterMock {
  createUser: jest.Mock;
  getUser: jest.Mock;
  getUserByEmail: jest.Mock;
  getUserByAccount: jest.Mock;
  linkAccount: jest.Mock;
  createSession: jest.Mock;
  getSessionAndUser: jest.Mock;
  updateSession: jest.Mock;
  deleteSession: jest.Mock;
  createVerificationToken: jest.Mock;
  useVerificationToken: jest.Mock;
}
