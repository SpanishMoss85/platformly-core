import { User } from '@/generated/prisma/client';

// Extend User type to include the role property needed by NextAuth
interface EnhancedUser extends User {
  role: string;
  image?: string | null;
}

interface UserFactoryProps {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
  role?: string;
  orgId?: string;
  image?: string | null; // Add this line
}

export function createUser(props: UserFactoryProps = {}): EnhancedUser {
  const roleId = props.roleId || 'user';
  
  return {
    id: props.id || 'test-user-id',
    email: props.email || 'test@example.com',
    name: props.name || 'Test User',
    password: props.password || '$2b$10$mockHashedPassword',
    roleId: roleId,
    role: props.role || roleId, // Default to using roleId value if role not provided
    orgId: props.orgId || 'test-org-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: null,
    firstName: null,
    lastName: null,
  };
}