import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import voucherApi from "../api/voucher.api.js";

export const useVoucher = () => {
  const queryClient = useQueryClient();

  const useGetActiveVouchers = () =>
    useQuery({
      queryKey: ["vouchers", "active"],
      queryFn: () => voucherApi.getActiveVouchers().then(res => res.data?.vouchers || []),
    });

  const useAdminGetVouchers = () =>
    useQuery({
      queryKey: ["admin", "vouchers"],
      queryFn: () => voucherApi.getAllVouchersAdmin().then(res => res.data?.vouchers || []),
    });

  const createVoucherMutation = useMutation({
    mutationFn: (data: any) => voucherApi.createVoucherAdmin(data),
    onSuccess: (res: any) => {
      toast.success(res.message || "Tạo mã giảm giá thành công! 🎟️");
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể tạo mã giảm giá.";
      toast.error(message);
    },
  });

  const updateVoucherMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => voucherApi.updateVoucherAdmin(id, data),
    onSuccess: (res: any) => {
      toast.success(res.message || "Cập nhật mã giảm giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật mã giảm giá.";
      toast.error(message);
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: (id: string) => voucherApi.deleteVoucherAdmin(id),
    onSuccess: (res: any) => {
      toast.success(res.message || "Xóa mã giảm giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể xóa mã giảm giá.";
      toast.error(message);
    },
  });

  const verifyVoucherMutation = useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      voucherApi.verifyVoucher(code, subtotal),
  });

  return {
    useGetActiveVouchers,
    useAdminGetVouchers,
    createVoucher: createVoucherMutation,
    updateVoucher: updateVoucherMutation,
    deleteVoucher: deleteVoucherMutation,
    verifyVoucher: verifyVoucherMutation,
  };
};
