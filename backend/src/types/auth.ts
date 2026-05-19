import { UserRole, UserStatus } from '@prisma/client';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  emailVerifyAt: Date | null;
  status: UserStatus;
}
