import { User, UserRole } from '@prisma/client';

export interface UserResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phoneNumber?: string | null;
  gender: string;
  isVerified: boolean;
  createdAt: Date;
}

export const toUserResponseDTO = (user: User): UserResponseDTO => {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    isVerified: !!user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
};
