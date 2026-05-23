/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type { WishlistResponse, ToggleWishlistResponse, WishlistIdsResponse } from "../types/index.js";

export const wishlistApi = {
  /**
   * Get user's wishlist
   */
  getWishlist: () =>
    apiClient.get<any, WishlistResponse>("/wishlist"),

  /**
   * Toggle product in user's wishlist
   */
  toggleWishlist: (productId: string) =>
    apiClient.post<any, ToggleWishlistResponse>("/wishlist/toggle", { productId }),

  /**
   * Get user's wishlist product IDs only
   */
  getWishlistIds: () =>
    apiClient.get<any, WishlistIdsResponse>("/wishlist/ids"),
};

export default wishlistApi;
