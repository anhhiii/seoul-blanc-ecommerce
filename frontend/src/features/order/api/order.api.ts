/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type { OrderResponse, OrderListResponse } from "../types/index.js";

export const orderApi = {
  createOrder: (addressId: string, note?: string) =>
    apiClient.post<any, OrderResponse>("/orders", { addressId, note }),

  getMyOrders: () =>
    apiClient.get<any, OrderListResponse>("/orders"),

  getOrderDetails: (orderId: string) =>
    apiClient.get<any, OrderResponse>(`/orders/${orderId}`),

  cancelOrder: (orderId: string) =>
    apiClient.post<any, OrderResponse>(`/orders/${orderId}/cancel`),

  refundOrder: (orderId: string, returnReason: string) =>
    apiClient.post<any, OrderResponse>(`/orders/${orderId}/refund`, { returnReason }),

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
};

export default orderApi;
