/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import wishlistApi from "../api/wishlist.api.js";
import { useAuthStore } from "../../../store/authStore.js";

export const useWishlist = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Query: Get user's wishlist detailed products
  const useGetWishlist = () =>
    useQuery({
      queryKey: ["wishlist"],
      queryFn: () => wishlistApi.getWishlist(),
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Query: Get user's wishlist product IDs only
  const useGetWishlistIds = () =>
    useQuery({
      queryKey: ["wishlist", "ids"],
      queryFn: () => wishlistApi.getWishlistIds(),
      enabled: isAuthenticated,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

  // Mutation: Toggle product in wishlist
  const toggleWishlistMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.toggleWishlist(productId),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật danh sách yêu thích thành công!");
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist", "ids"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật danh sách yêu thích";
      toast.error(message);
    },
  });

  return {
    useGetWishlist,
    useGetWishlistIds,
    toggleWishlist: toggleWishlistMutation,
  };
};

export default useWishlist;
