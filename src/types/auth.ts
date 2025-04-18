import type { EnhancedUser } from './user';

export interface AuthSession {
  user: Pick<EnhancedUser, 'id' | 'role' | 'orgId' | 'email' | 'name' | 'image'>;
  expires: string;
  accessToken?: string;
  refreshToken?: string;
}