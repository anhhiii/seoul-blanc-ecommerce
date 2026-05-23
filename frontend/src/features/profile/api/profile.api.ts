/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type { UpdateProfileRequest, ProfileResponse, UploadResponse } from "../types/index.js";

export const profileApi = {
  /**
   * Lấy thông tin cá nhân
   */
  getProfile: () =>
    apiClient.get<any, ProfileResponse>("/profile"),

  /**
   * Cập nhật thông tin cá nhân
   */
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<any, ProfileResponse>("/profile", data),

  /**
   * Cập nhật ảnh đại diện
   */
  updateAvatar: (avatarUrl: string | null) =>
    apiClient.put<any, ProfileResponse>("/profile/avatar", { avatar: avatarUrl }),

  /**
   * Đổi mật khẩu
   */
  changePassword: (data: any) =>
    apiClient.put<any, { success: boolean; message: string }>("/profile/change-password", data),

  /**
   * Upload ảnh lên Cloudinary qua endpoint chung
   */
  uploadAvatarFile: (formData: FormData) =>
    apiClient.post<any, UploadResponse>("/upload/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default profileApi;
