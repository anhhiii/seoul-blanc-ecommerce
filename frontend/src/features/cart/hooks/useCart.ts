/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import cartApi from "../api/cart.api.js";
import { useAuthStore } from "../../../store/authStore.js";

export const useCart = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  // Query: Get cart (only if authenticated)
  const useGetCart = () =>
    useQuery({
      queryKey: ["cart"],
      queryFn: () => cartApi.getCart(),
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Mutation: Add to cart
  const addToCartMutation = useMutation({
    mutationFn: ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) =>
      cartApi.addToCart(productVariantId, quantity),
    onSuccess: (response) => {
      toast.success(response.message || "Đã thêm sản phẩm vào giỏ hàng! 🛒");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng";
      toast.error(message);
    },
  });

  // Mutation: Update item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: ({ productVariantId, quantity }: { productVariantId: string; quantity: number }) =>
      cartApi.updateCartItem(productVariantId, quantity),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật giỏ hàng thành công!");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật số lượng";
      toast.error(message);
    },
  });

  // Mutation: Remove item
  const removeFromCartMutation = useMutation({
    mutationFn: (productVariantId: string) => cartApi.removeFromCart(productVariantId),
    onSuccess: (response) => {
      toast.success(response.message || "Đã xóa sản phẩm khỏi giỏ hàng");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể xóa sản phẩm";
      toast.error(message);
    },
  });

  // Mutation: Clear cart
  const clearCartMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: (response) => {
      toast.success(response.message || "Đã làm trống giỏ hàng");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể xóa giỏ hàng";
      toast.error(message);
    },
  });

  return {
    useGetCart,
    addToCart: addToCartMutation,
    updateCartItem: updateCartItemMutation,
    removeFromCart: removeFromCartMutation,
    clearCart: clearCartMutation,
    isAuthenticated,
  };
};

export default useCart;
