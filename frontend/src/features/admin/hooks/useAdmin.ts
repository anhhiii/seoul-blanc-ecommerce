import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import adminApi from "../api/admin.api.js";

export const useAdmin = () => {
  const queryClient = useQueryClient();

  const useGetUsers = () =>
    useQuery({
      queryKey: ["admin", "users"],
      queryFn: () => adminApi.getUsers().then(res => res.data?.users || []),
    });

  const useGetDashboardStats = () =>
    useQuery({
      queryKey: ["admin", "analytics"],
      queryFn: () => adminApi.getDashboardStats().then(res => res.data || {}),
      refetchInterval: 30000, // Auto-refetch every 30 seconds
    });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: (res: any) => {
      toast.success(res.message || "Cập nhật trạng thái người dùng thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật trạng thái người dùng.";
      toast.error(message);
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: (res: any) => {
      toast.success(res.message || "Cập nhật quyền người dùng thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật quyền người dùng.";
      toast.error(message);
    },
  });

  return {
    useGetUsers,
    useGetDashboardStats,
    updateUserStatus: updateUserStatusMutation,
    updateUserRole: updateUserRoleMutation,
  };
};
