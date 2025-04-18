import { PrismaClient } from '@prisma/client';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

/**
 * Retrieves the authorized launch URL for an application.
 *
 * @param userId - The ID of the user.
 * @param organizationId - The ID of the organization.
 * @param applicationId - The ID of the application.
 * @returns The launch URL if authorized, otherwise throws an error.
 * @throws Error if unauthorized or application not found.
 */
export async function getAuthorizedLaunchUrl(
  userId: string,
  organizationId: string,
  applicationId: string,
): Promise<string> {
  try {
    logger.info(
      `Attempting to authorize launch URL for application ${applicationId}, user ${userId}, organization ${organizationId}`,
    );

    const [user, organization, subscription, application] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.organization.findUnique({ where: { id: organizationId } }),
      prisma.subscription.findFirst({ where: { orgId: organizationId } }),
      prisma.application.findUnique({ where: { id: applicationId } }),
    ]);

    if (!application) {
      logger.warn(`Application ${applicationId} not found`);
      throw new Error('Application not found');
    }

    if (!organization) {
      logger.warn(`Organization ${organizationId} not found`);
      throw new Error('Organization not found');
    }

    if (!user) {
      logger.warn(`User ${userId} not found`);
      throw new Error('User not found');
    }

    if (!subscription) {
      logger.warn(`Subscription not found for organization ${organizationId}`);
      throw new Error('Subscription not found');
    }

    const organizationApplication = await prisma.organizationApplication.findUnique({
      where: {
        orgId_applicationId: {
          orgId: organizationId,
          applicationId: applicationId,
        },
      },
    });

    if (!organizationApplication) {
      logger.warn(
        `Application ${applicationId} is not assigned to organization ${organizationId}`,
      );
      throw new Error('Unauthorized');
    }

    // Assuming there's an 'enabled' field in the Application model
    // if (!application.enabled) {
    //   logger.warn(`Application ${applicationId} is disabled`);
    //   throw new Error('Application disabled');
    // }

    if (subscription.status !== 'active') {
      logger.warn(
        `Subscription for organization ${organizationId} is not active (status: ${subscription.status})`,
      );
      throw new Error('Subscription inactive');
    }

    logger.info(`Successfully authorized launch URL for application ${applicationId}`);
    return application.name; // Replace with the actual launch URL property

  } catch (error) {
    logger.error(
      `Error authorizing launch URL for application ${applicationId}, user ${userId}, organization ${organizationId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    throw error;
  }
}