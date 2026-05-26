/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import orderApi from "../api/order.api.js";
import { useAuthStore } from "../../../store/authStore.js";

export const useOrder = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  // Query: Get my orders
  const useGetOrders = () =>
    useQuery({
      queryKey: ["orders"],
      queryFn: () => orderApi.getMyOrders(),
      enabled: isAuthenticated,
      refetchInterval: 5000, // auto refetch every 5s
    });

  // Query: Get order details
  const useGetOrderDetails = (orderId: string) =>
    useQuery({
      queryKey: ["orders", orderId],
      queryFn: () => orderApi.getOrderDetails(orderId),
      enabled: isAuthenticated && !!orderId,
    });

  // Mutation: Create Order
  const createOrderMutation = useMutation({
    mutationFn: ({ addressId, note, voucherCode }: { addressId: string; note?: string; voucherCode?: string }) =>
      orderApi.createOrder(addressId, note, voucherCode),
    onSuccess: (response) => {
      toast.success(response.message || "Đặt hàng thành công! 🎉");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể đặt hàng. Vui lòng thử lại.";
      toast.error(message);
    },
  });

  // Mutation: Cancel Order
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: (response) => {
      toast.success(response.message || "Hủy đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể hủy đơn hàng";
      toast.error(message);
    },
  });

  // Mutation: Refund/Return Order
  const refundOrderMutation = useMutation({
    mutationFn: ({ orderId, returnReason }: { orderId: string; returnReason: string }) =>
      orderApi.refundOrder(orderId, returnReason),
    onSuccess: (response) => {
      toast.success(response.message || "Yêu cầu trả hàng hoàn tiền đã được gửi và đang chờ duyệt!");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể yêu cầu trả hàng hoàn tiền";
      toast.error(message);
    },
  });

  // Query: Get all orders (Admin)
  const useAdminGetOrders = () =>
    useQuery({
      queryKey: ["admin", "orders"],
      queryFn: () => orderApi.getAllOrdersAdmin(),
      enabled: isAuthenticated,
      refetchInterval: 4000, // auto refetch every 4s
    });

  // Mutation: Update status (Admin)
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderApi.updateOrderStatusAdmin(orderId, status),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật trạng thái";
      toast.error(message);
    },
  });

  // Mutation: Handle return request (Admin)
  const handleReturnRequestMutation = useMutation({
    mutationFn: ({ orderId, action }: { orderId: string; action: 'APPROVE' | 'REJECT' }) =>
      orderApi.handleReturnRequestAdmin(orderId, action),
    onSuccess: (response) => {
      toast.success(response.message || "Xử lý yêu cầu hoàn trả thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể xử lý yêu cầu hoàn trả";
      toast.error(message);
    },
  });

  // Query: Get notifications
  const useGetNotifications = () =>
    useQuery({
      queryKey: ["notifications"],
      queryFn: () => orderApi.getNotifications(),
      enabled: isAuthenticated,
      refetchInterval: 3000, // auto refetch every 3s
    });

  // Mutation: Mark all as read
  const markNotificationsReadMutation = useMutation({
    mutationFn: () => orderApi.markNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mutation: Mark single as read
  const markSingleNotificationReadMutation = useMutation({
    mutationFn: (id: string) => orderApi.markSingleNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    useGetOrders,
    useGetOrderDetails,
    createOrder: createOrderMutation,
    cancelOrder: cancelOrderMutation,
    refundOrder: refundOrderMutation,
    useAdminGetOrders,
    updateStatus: updateStatusMutation,
    handleReturnRequest: handleReturnRequestMutation,
    useGetNotifications,
    markNotificationsRead: markNotificationsReadMutation,
    markSingleNotificationRead: markSingleNotificationReadMutation,
    isAuthenticated,
  };
};

export default useOrder;
