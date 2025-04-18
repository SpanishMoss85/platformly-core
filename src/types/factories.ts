export interface UserFactoryProps {
  id?: string;
  email?: string | null;
  name?: string | null;
  password?: string;
  roleId?: string;
  role?: string;
  orgId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  emailVerified?: Date | null;
  firstName?: string | null;
  lastName?: string | null;
  image?: string | null;
}