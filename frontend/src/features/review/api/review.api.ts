import apiClient from "../../../shared/services/apiClient.js";

export const reviewApi = {
  createReview: (productId: string, rating: number, comment?: string) =>
    apiClient.post("/reviews", { productId, rating, comment }),

  getProductReviews: (productId: string) =>
    apiClient.get<any, any>(`/reviews/product/${productId}`),
};

export default reviewApi;
