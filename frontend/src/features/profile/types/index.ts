import type { User } from '../../../store/authStore.js';

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
  };
}
