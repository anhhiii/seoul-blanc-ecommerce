/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type { CartResponse } from "../types/index.js";

export const cartApi = {
  getCart: () =>
    apiClient.get<any, CartResponse>("/cart"),

  addToCart: (productVariantId: string, quantity: number) =>
    apiClient.post<any, CartResponse>("/cart/items", { productVariantId, quantity }),

  updateCartItem: (productVariantId: string, quantity: number) =>
    apiClient.put<any, CartResponse>(`/cart/items/${productVariantId}`, { quantity }),

  removeFromCart: (productVariantId: string) =>
    apiClient.delete<any, CartResponse>(`/cart/items/${productVariantId}`),

  clearCart: () =>
    apiClient.delete<any, CartResponse>("/cart"),
};

export default cartApi;
