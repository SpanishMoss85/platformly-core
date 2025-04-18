import { PrismaClient } from '@prisma/client';
import * as Prisma from '../generated/prisma';

/**
 * Prisma client instance.
 */

const prisma = new PrismaClient();

/**
 * Checks if a user has a specific permission.
 *
 * This function determines if a user is authorized to perform a specific action
 * based on their role, subscription level, and potentially organization-specific flags.
 *
 * @param user - The user object, including their role and organization.
 * @param permissionName - The name of the permission to check (e.g., 'user:read').
 * @returns A boolean indicating whether the user has the permission.
 */

  /**
   * @description This function checks if a user has a specific permission based on their roles, subscription and organization flags.
   * @param user The user object containing role and organization information
   * @param permissionName The name of the permission to check
   * @returns True if the user has the permission, false otherwise
   */
export async function hasPermission(
  user: Prisma.User & { role: Prisma.Role & {RolePermission: any[]}; org: { Subscription: {status: string, plan: {permissions: any[]}}[], flags?: string[] } },
  permissionName: string,
  prismaClient?: any
): Promise<boolean> {
  const prisma = prismaClient || new PrismaClient();

  if (user.role?.name === 'GOD_MODE') {
    return true;
  }

  const rolePermissions = user.role?.RolePermission?.filter(rp => rp.permission.name === permissionName) || [];

  if (rolePermissions.length > 0) {
    return true;
  }

  const activeSubscription = user.org.Subscription.find((sub) => sub.status === 'active');

  if (activeSubscription) {
    const subscriptionPermissions = activeSubscription.plan.permissions.map(p => p.name);
    if (subscriptionPermissions.includes(permissionName)) {
      return true;
    }
  }

  if (user.org.flags?.includes(permissionName)) {
    return true;
  }

  return false;
}