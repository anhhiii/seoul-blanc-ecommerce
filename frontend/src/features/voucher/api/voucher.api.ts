import apiClient from "../../../shared/services/apiClient.js";

export const voucherApi = {
  getActiveVouchers: () =>
    apiClient.get<any, any>("/vouchers/active"),

  verifyVoucher: (code: string, subtotal: number) =>
    apiClient.post<any, any>("/vouchers/verify", { code, subtotal }),

  getAllVouchersAdmin: () =>
    apiClient.get<any, any>("/admin/vouchers"),

  createVoucherAdmin: (data: any) =>
    apiClient.post<any, any>("/admin/vouchers", data),

  updateVoucherAdmin: (id: string, data: any) =>
    apiClient.put<any, any>(`/admin/vouchers/${id}`, data),

  deleteVoucherAdmin: (id: string) =>
    apiClient.delete<any, any>(`/admin/vouchers/${id}`),
};

export default voucherApi;
