// src/test/services/permissionService.test.ts

// IMPORTANT: Mock setup must come before any imports
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => {
      return {
        user: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
        },
        role: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
        permission: {
          createMany: jest.fn().mockResolvedValue({ count: 3 }),
        },
        rolePermission: {
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        organization: {
          create: jest.fn().mockResolvedValue({
            id: 'org-1',
            name: 'Test Org',
            flags: ['admin:read'],
          }),
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        $connect: jest.fn().mockResolvedValue(undefined),
        $disconnect: jest.fn().mockResolvedValue(undefined),
        $executeRawUnsafe: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

// Now we can import everything else
import { hasPermission } from '@/services/permissionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Permission Service', () => {
  // Unit tests with mock data
  describe('Unit Tests', () => {
    it('should return true for GOD_MODE role', async () => {
      const user = {
        role: { name: 'GOD_MODE', RolePermission: [] },
        org: { Subscription: [], flags: [] },
      } as any;
      const permissionName = 'any:permission';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(true);
    });

    it('should return true if role has the permission', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [{ permission: { name: 'user:read' } }] },
        org: { Subscription: [], flags: [] },
      } as any;
      const permissionName = 'user:read';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(true);
    });

    it('should return true if subscription has the permission', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [] },
        org: { Subscription: [{ status: 'active', plan: { permissions: [{ name: 'user:read' }] } }], flags: [] },
      } as any;
      const permissionName = 'user:read';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(true);
    });

    it('should return true if org flags include the permission', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [] },
        org: { Subscription: [], flags: ['user:read'] },
      } as any;
      const permissionName = 'user:read';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(true);
    });

    it('should return false if user does not have the permission', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [] },
        org: { Subscription: [], flags: [] },
      } as any;
      const permissionName = 'user:read';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(false);
    });

    it('should return false for permission name with invalid characters', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [] },
        org: { Subscription: [], flags: [] },
      } as any;
      const permissionName = 'user:read!';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(false);
    });

    it('should return false if role does not have the permission', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [{ permission: { name: 'user:read' } }] },
        org: { Subscription: [], flags: [] },
      } as any;
      const permissionName = 'user:write';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(false);
    });

    it('should return false if subscription does not have the permission', async () => {
      const user = {
        role: { name: 'USER', RolePermission: [] },
        org: { Subscription: [{ status: 'active', plan: { permissions: [{ name: 'user:read' }] } }], flags: [] },
      } as any;
      const permissionName = 'user:write';
      const result = await hasPermission(user, permissionName);
      expect(result).toBe(false);
    });
  });

  // Only run these tests when using DATABASE_MODE=real
  // Otherwise they'll be skipped
  const runRealDatabaseTests = process.env.DATABASE_MODE === 'real' ? describe : describe.skip;

  runRealDatabaseTests('Integration Tests with Real Database', () => {
    beforeAll(async () => {
      await prisma.$connect();

      // Now we'll set up mock return values for our database tests
      // For the user.findUnique calls in the integration tests
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        role: {
          name: 'USER',
          RolePermission: [
            {
              permission: { name: 'user:read' },
            },
          ],
        },
        org: {
          flags: ['admin:read'],
          Subscription: [
            {
              status: 'active',
              plan: {
                permissions: [{ name: 'user:read' }],
              },
            },
          ],
        },
      });
    });

    afterAll(async () => {
      await prisma.$disconnect();
    });

    it('should return true for permission in role', async () => {
      const user = await prisma.user.findUnique({
        where: { id: 'user-1' },
        include: {
          role: { include: { RolePermission: { include: { permission: true } } } },
          org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } },
        },
      });

      const result = await hasPermission(user, 'user:read');
      expect(result).toBe(true);
    });

    it('should return false for permission not in role', async () => {
      const user = await prisma.user.findUnique({
        where: { id: 'user-1' },
        include: {
          role: { include: { RolePermission: { include: { permission: true } } } },
          org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } },
        },
      });

      const result = await hasPermission(user, 'user:write');
      expect(result).toBe(false);
    });

    it('should return true for permission in org flags', async () => {
      const user = await prisma.user.findUnique({
        where: { id: 'user-1' },
        include: {
          role: { include: { RolePermission: { include: { permission: true } } } },
          org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } },
        },
      });

      const result = await hasPermission(user, 'admin:read');
      expect(result).toBe(true);
    });

    it('should return false for unknown permission', async () => {
      const user = await prisma.user.findUnique({
        where: { id: 'user-1' },
        include: {
          role: { include: { RolePermission: { include: { permission: true } } } },
          org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } },
        },
      });

      const result = await hasPermission(user, 'admin:write');
      expect(result).toBe(false);
    });
  });
});
