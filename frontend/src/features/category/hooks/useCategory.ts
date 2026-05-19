/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import categoryApi from "../api/category.api.js";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "../types/index.js";

export const useCategory = () => {
  const queryClient = useQueryClient();

  // Query: Get public categories
  const useGetCategories = () =>
    useQuery({
      queryKey: ["categories"],
      queryFn: () => categoryApi.getCategories(),
    });

  // Query: Get admin categories
  const useAdminGetCategories = () =>
    useQuery({
      queryKey: ["admin-categories"],
      queryFn: () => categoryApi.adminGetCategories(),
    });

  // Query: Get single category detail
  const useGetCategory = (id: string, enabled = true) =>
    useQuery({
      queryKey: ["category", id],
      queryFn: () => categoryApi.adminGetCategory(id),
      enabled: !!id && enabled,
    });

  // Mutation: Create category
  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryApi.adminCreateCategory(data),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo danh mục thành công! 🎉");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Tạo danh mục thất bại";
      toast.error(message);
    },
  });

  // Mutation: Update category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      categoryApi.adminUpdateCategory(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Cập nhật danh mục thành công! 🎉");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Cập nhật danh mục thất bại";
      toast.error(message);
    },
  });

  // Mutation: Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryApi.adminDeleteCategory(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa danh mục thành công! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Xóa danh mục thất bại";
      toast.error(message);
    },
  });

  // Mutation: Upload image
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => categoryApi.adminUploadImage(file),
    onError: (error: any) => {
      const message = error.response?.data?.message || "Tải ảnh thất bại";
      toast.error(message);
    },
  });

  return {
    useGetCategories,
    useAdminGetCategories,
    useGetCategory,
    createCategory: createCategoryMutation,
    updateCategory: updateCategoryMutation,
    deleteCategory: deleteCategoryMutation,
    uploadImage: uploadImageMutation,
  };
};

export default useCategory;
