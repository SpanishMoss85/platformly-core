// src/test/mocks/prisma.ts
import { PrismaMock, PrismaAdapterMock } from '@/types/prisma';
// Create the mock client with all models and methods
const prismaClientMock: PrismaMock = {
  user: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  organization: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  role: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  permission: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  rolePermission: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  application: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  organizationApplication: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  subscription: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  account: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  session: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  verificationToken: {
    findUnique: jest.fn().mockResolvedValue(null),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data: any) => data.data),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    update: jest.fn().mockImplementation((data: any) => data.data),
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    delete: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    upsert: jest.fn().mockImplementation((data: any) => data.create),
    count: jest.fn().mockResolvedValue(0),
  },
  // Add transaction and raw query methods
  $transaction: jest.fn((callback: any) => {
    if (typeof callback === 'function') {
      return callback(prismaClientMock);
    }
    return Promise.resolve(callback);
  }),
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
  $queryRawUnsafe: jest.fn().mockResolvedValue([]),
};

// Create a mock for the Prisma adapter
const mockPrismaAdapter: PrismaAdapterMock = {
  createUser: jest.fn(),
  getUser: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserByAccount: jest.fn(),
  linkAccount: jest.fn(),
  createSession: jest.fn(),
  getSessionAndUser: jest.fn(),
  updateSession: jest.fn(),
  deleteSession: jest.fn(),
  createVerificationToken: jest.fn(),
  useVerificationToken: jest.fn(),
};

// Now mock the modules
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaClientMock),
  };
});

jest.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => mockPrismaAdapter),
}));

// Export the mock for use in tests
export default prismaClientMock;
export { mockPrismaAdapter };
