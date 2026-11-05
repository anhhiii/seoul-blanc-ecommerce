/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type { OrderResponse, OrderListResponse } from "../types/index.js";

export const orderApi = {
  createOrder: (data: {
    addressId: string;
    paymentMethod?: 'COD' | 'SEPAY' | 'BLANC_PAY';
    note?: string;
    voucherCode?: string;
    selectedVariantIds?: string[];
    directItem?: { productVariantId: string; quantity: number };
    useWalletBalance?: boolean;
  }) => apiClient.post<any, OrderResponse>("/orders", data),

  getMyOrders: () =>
    apiClient.get<any, OrderListResponse>("/orders"),

  getOrderDetails: (orderId: string) =>
    apiClient.get<any, OrderResponse>(`/orders/${orderId}`),

  checkSePayPayment: (orderId: string) =>
    apiClient.get<any, any>(`/orders/${orderId}/check-payment`),

  cancelOrder: (orderId: string) =>
    apiClient.post<any, OrderResponse>(`/orders/${orderId}/cancel`),

  refundOrder: (
    orderId: string,
    returnReason: string,
    bankInfo?: { bankName?: string; accountNumber?: string; accountName?: string }
  ) =>
    apiClient.post<any, OrderResponse>(`/orders/${orderId}/refund`, { returnReason, bankInfo }),

  getAllOrdersAdmin: () =>
    apiClient.get<any, OrderListResponse>("/admin/orders"),

  updateOrderStatusAdmin: (orderId: string, status: string) =>
    apiClient.put<any, OrderResponse>(`/admin/orders/${orderId}/status`, { status }),

  handleReturnRequestAdmin: (orderId: string, action: 'APPROVE' | 'REJECT') =>
    apiClient.post<any, OrderResponse>(`/admin/orders/${orderId}/return-request`, { action }),

  getNotifications: () =>
    apiClient.get<any, any>("/notifications"),

  markNotificationsRead: () =>
    apiClient.post<any, any>("/notifications/mark-all-read"),

  markSingleNotificationRead: (id: string) =>
    apiClient.patch<any, any>(`/notifications/${id}/read`),

  deleteAllNotifications: () =>
    apiClient.delete<any, any>("/notifications/all"),

  deleteNotification: (id: string) =>
    apiClient.delete<any, any>(`/notifications/${id}`),
};

export default orderApi;
