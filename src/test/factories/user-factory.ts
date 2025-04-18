import { User } from '@/generated/prisma/client';

interface UserFactoryProps {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
  orgId?: string;
}

export function createUser(props: UserFactoryProps = {}): User {
  return {
    id: props.id || 'test-user-id',
    email: props.email || 'test@example.com',
    name: props.name || 'Test User',
    password: props.password || '$2b$10$mockHashedPassword',
    roleId: props.roleId || 'user',
    orgId: props.orgId || 'test-org-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    image: null,
  };
}
