import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import reviewApi from "../api/review.api.js";

export const useReview = () => {
  const queryClient = useQueryClient();

  const useGetProductReviews = (productId: string) =>
    useQuery({
      queryKey: ["reviews", productId],
      queryFn: () => reviewApi.getProductReviews(productId).then(res => res.data?.reviews || []),
      enabled: !!productId,
    });

  const createReviewMutation = useMutation({
    mutationFn: ({ productId, rating, comment }: { productId: string; rating: number; comment?: string }) =>
      reviewApi.createReview(productId, rating, comment),
    onSuccess: (res: any) => {
      toast.success(res.message || "Đánh giá sản phẩm thành công! ⭐");
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể gửi đánh giá.";
      toast.error(message);
    },
  });

  return {
    useGetProductReviews,
    createReview: createReviewMutation,
  };
};
