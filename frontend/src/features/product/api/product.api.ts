/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductResponse,
  ProductsListResponse,
  ProductQueryFilters,
  FeaturedProductsResponse,
} from "../types/index.js";

export const productApi = {
  // Public Product Endpoints
  getProducts: (filters?: ProductQueryFilters) =>
    apiClient.get<any, ProductsListResponse>("/products", { params: filters }),

  getFeaturedProducts: () =>
    apiClient.get<any, FeaturedProductsResponse>("/products/featured"),

  getProduct: (idOrSlug: string) =>
    apiClient.get<any, ProductResponse>(`/products/${idOrSlug}`),

  // Admin Product Endpoints
  adminGetProducts: (filters?: ProductQueryFilters) =>
    apiClient.get<any, ProductsListResponse>("/admin/products", { params: filters }),

  adminGetProduct: (id: string) =>
    apiClient.get<any, ProductResponse>(`/admin/products/${id}`),

  adminCreateProduct: (data: CreateProductInput) =>
    apiClient.post<any, ProductResponse>("/admin/products", data),

  adminUpdateProduct: (id: string, data: UpdateProductInput) =>
    apiClient.put<any, ProductResponse>(`/admin/products/${id}`, data),

  adminDeleteProduct: (id: string) =>
    apiClient.delete<any, { success: boolean; message: string }>(`/admin/products/${id}`),
};

export default productApi;
