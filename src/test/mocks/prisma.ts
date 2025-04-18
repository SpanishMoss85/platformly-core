// Create a mock Prisma client instance with typed methods
const prismaClientMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  account: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  session: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock the PrismaClient constructor to return our mock instance
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaClientMock),
  };
});

// Mock the Prisma adapter
jest.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn().mockImplementation(() => ({
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
  })),
}));

export default prismaClientMock;
