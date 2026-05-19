/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoriesResponse,
  CategoryDetailResponse,
} from "../types/index.js";

export const categoryApi = {
  // Public Category Endpoints
  getCategories: () =>
    apiClient.get<any, CategoriesResponse>("/categories"),

  getCategory: (id: string) =>
    apiClient.get<any, CategoryDetailResponse>(`/categories/${id}`),

  // Admin Category Endpoints
  adminGetCategories: () =>
    apiClient.get<any, CategoriesResponse>("/admin/categories"),

  adminGetCategory: (id: string) =>
    apiClient.get<any, CategoryDetailResponse>(`/admin/categories/${id}`),

  adminCreateCategory: (data: CreateCategoryRequest) =>
    apiClient.post<any, CategoryDetailResponse>("/admin/categories", data),

  adminUpdateCategory: (id: string, data: UpdateCategoryRequest) =>
    apiClient.put<any, CategoryDetailResponse>(`/admin/categories/${id}`, data),

  adminDeleteCategory: (id: string) =>
    apiClient.delete<any, { success: boolean; message: string }>(`/admin/categories/${id}`),

  adminUploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<any, { success: boolean; message: string; data: { url: string } }>(
      '/admin/upload/single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};

export default categoryApi;
