/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import addressApi from "../api/address.api.js";
import { useAuthStore } from "../../../store/authStore.js";
import type { CreateAddressInput, UpdateAddressInput } from "../types/index.js";

export const useAddress = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Query: Get all addresses
  const useGetAddresses = () =>
    useQuery({
      queryKey: ["addresses"],
      queryFn: () => addressApi.getAddresses(),
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 10, // 10 minutes
    });

  // Mutation: Create address
  const createAddressMutation = useMutation({
    mutationFn: (data: CreateAddressInput) => addressApi.createAddress(data),
    onSuccess: (response) => {
      toast.success(response.message || "Thêm địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể thêm địa chỉ";
      toast.error(message);
    },
  });

  // Mutation: Update address
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressInput }) =>
      addressApi.updateAddress(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật địa chỉ";
      toast.error(message);
    },
  });

  // Mutation: Delete address
  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.deleteAddress(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa địa chỉ thành công!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể xóa địa chỉ";
      toast.error(message);
    },
  });

  // Mutation: Set default address
  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => addressApi.setDefaultAddress(id),
    onSuccess: (response) => {
      toast.success(response.message || "Đặt địa chỉ mặc định thành công!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể đặt làm địa chỉ mặc định";
      toast.error(message);
    },
  });

  return {
    useGetAddresses,
    createAddress: createAddressMutation,
    updateAddress: updateAddressMutation,
    deleteAddress: deleteAddressMutation,
    setDefaultAddress: setDefaultAddressMutation,
  };
};

export default useAddress;
