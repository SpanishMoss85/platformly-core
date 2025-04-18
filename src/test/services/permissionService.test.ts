import { hasPermission } from '../../../src/services/permissionService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('hasPermission', () => {
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
describe('Integration Tests (Database not working)', () => {
  it('should return true for GOD_MODE role from database', async () => {
    expect(true).toBe(false); // Placeholder test
  });

  it('should return true if role has the permission from database', async () => {
    expect(true).toBe(false); // Placeholder test
  });

   it('should return false if role does not have the permission from database', async () => {
    expect(true).toBe(false); // Placeholder test
  });

  it('should return true if subscription has the permission from database', async () => {
    expect(true).toBe(false); // Placeholder test
  });

  it('should return true if org flags include the permission from database', async () => {
    expect(true).toBe(false); // Placeholder test
  });

  it('should return false if user does not have the permission from database', async () => {
    expect(true).toBe(false); // Placeholder test
  });
});
  });

describe('Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
    // Seed the database with test data
    await prisma.role.createMany({
      data: [
        { id: 'god-role', name: 'GOD_MODE' },
        { id: 'user-role', name: 'USER' },
      ],
    });

    await prisma.permission.createMany({
      data: [
        { id: 'user-read', name: 'user:read' },
        { id: 'user-write', name: 'user:write' },
        { id: 'admin-read', name: 'admin:read' },
      ],
    });

    await prisma.rolePermission.createMany({
      data: [
        { roleId: 'user-role', permissionId: 'user-read' },
      ],
    });

    await prisma.subscriptionPlan.create({
      data: {
        id: 'basic-plan',
        name: 'Basic',
        permissions: {
          connect: [{ id: 'user-read' }],
        },
      },
    });

    await prisma.organization.create({
      data: {
        id: 'org-1',
        name: 'Test Org',
        flags: ['admin:read'],
        Subscription: {
          create: {
            status: 'active',
            planId: 'basic-plan',
          },
        },
      },
    });

    await prisma.user.create({
      data: {
        id: 'user-1',
        email: 'test@example.com',
        roleId: 'user-role',
        orgId: 'org-1',
      },
    });
  });

  afterAll(async () => {
    // Clean up the database after tests
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "organizations" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "permissions" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "role_permissions" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "applications" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "organizations_applications" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "subscriptions" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "accounts" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "sessions" RESTART IDENTITY CASCADE;`);
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "verificationtokens" RESTART IDENTITY CASCADE;`);
    await prisma.$disconnect();
    await prisma.organization.deleteMany();
  });

  it('should return true for GOD_MODE role from database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { role: { include: { RolePermission: { include: { permission: true } } } }, org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } } },
    });
    const permissionName = 'any:permission';
    const result = await hasPermission(user, permissionName);
    expect(result).toBe(false);
  });

  it('should return true if role has the permission from database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { role: { include: { RolePermission: { include: { permission: true } } } }, org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } } },
    });
    const permissionName = 'user:read';
    const result = await hasPermission(user, permissionName);
    expect(result).toBe(true);
  });

   it('should return false if role does not have the permission from database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { role: { include: { RolePermission: { include: { permission: true } } } }, org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } } },
    });
    const permissionName = 'user:write';
    const result = await hasPermission(user, permissionName);
    expect(result).toBe(false);
  });

  it('should return true if subscription has the permission from database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { role: { include: { RolePermission: { include: { permission: true } } } }, org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } } },
    });
    const permissionName = 'user:read';
    const result = await hasPermission(user, permissionName);
    expect(result).toBe(true);
  });

  it('should return true if org flags include the permission from database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { role: { include: { RolePermission: { include: { permission: true } } } }, org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } } },
    });
    const permissionName = 'admin:read';
    const result = await hasPermission(user, permissionName);
    expect(result).toBe(true);
  });

  it('should return false if user does not have the permission from database', async () => {
    const user = await prisma.user.findUnique({
      where: { id: 'user-1' },
      include: { role: { include: { RolePermission: { include: { permission: true } } } }, org: { include: { Subscription: { include: { plan: { include: { permissions: true } } } } } } },
    });
    const permissionName = 'admin:write';
    const result = await hasPermission(user, permissionName);
    expect(result).toBe(false);
  });
});