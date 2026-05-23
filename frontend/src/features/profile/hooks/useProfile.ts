/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import profileApi from "../api/profile.api.js";
import { useAuthStore } from "../../../store/authStore.js";
import type { UpdateProfileRequest } from "../types/index.js";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Query: Get current profile details
  const useGetProfile = () =>
    useQuery({
      queryKey: ["profile"],
      queryFn: () => profileApi.getProfile(),
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Mutation: Update profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật thông tin thành công!");
      // Update state in Zustand store
      updateUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật thông tin";
      toast.error(message);
    },
  });

  // Mutation: Update avatar
  const updateAvatarMutation = useMutation({
    mutationFn: (avatarUrl: string | null) => profileApi.updateAvatar(avatarUrl),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật ảnh đại diện thành công!");
      updateUser(response.data.user);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật ảnh đại diện";
      toast.error(message);
    },
  });

  // Mutation: Change password
  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => profileApi.changePassword(data),
    onSuccess: (response) => {
      toast.success(response.message || "Thay đổi mật khẩu thành công!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể thay đổi mật khẩu";
      toast.error(message);
    },
  });

  // Mutation: Upload avatar image
  const uploadAvatarMutation = useMutation({
    mutationFn: (formData: FormData) => profileApi.uploadAvatarFile(formData),
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể tải lên tệp tin";
      toast.error(message);
    },
  });

  return {
    useGetProfile,
    updateProfile: updateProfileMutation,
    updateAvatar: updateAvatarMutation,
    changePassword: changePasswordMutation,
    uploadAvatar: uploadAvatarMutation,
  };
};

export default useProfile;
