import apiClient from "../../../shared/services/apiClient.js";

export const adminApi = {
  getUsers: () =>
    apiClient.get<any, any>("/admin/users"),

  updateUserStatus: (id: string, status: string) =>
    apiClient.put<any, any>(`/admin/users/${id}/status`, { status }),

  updateUserRole: (id: string, role: string) =>
    apiClient.put<any, any>(`/admin/users/${id}/role`, { role }),

  getDashboardStats: () =>
    apiClient.get<any, any>("/admin/analytics/dashboard"),
};

export default adminApi;
