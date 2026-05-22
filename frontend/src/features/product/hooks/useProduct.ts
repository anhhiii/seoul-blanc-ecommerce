/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import productApi from "../api/product.api.js";
import type { CreateProductInput, UpdateProductInput, ProductQueryFilters } from "../types/index.js";

export const useProduct = () => {
  const queryClient = useQueryClient();

  // Query: Get public products
  const useGetProducts = (
    filters?: ProductQueryFilters,
    options?: { enabled?: boolean }
  ) =>
    useQuery({
      queryKey: ["products", filters],
      queryFn: () => productApi.getProducts(filters),
      enabled: options?.enabled,
    });

  // Query: Get public products with infinite scroll
  const useGetProductsInfinite = (filters?: Omit<ProductQueryFilters, 'page'>) =>
    useInfiniteQuery({
      queryKey: ["products-infinite", filters],
      queryFn: ({ pageParam = 1 }) =>
        productApi.getProducts({ ...filters, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage: any) => {
        const pagination = lastPage?.data?.pagination;
        if (!pagination) return undefined;
        const { page, totalPages } = pagination;
        return page < totalPages ? page + 1 : undefined;
      },
    });

  // Query: Get featured products
  const useGetFeaturedProducts = () =>
    useQuery({
      queryKey: ["products-featured"],
      queryFn: () => productApi.getFeaturedProducts(),
    });

  // Query: Get admin products
  const useAdminGetProducts = (filters?: ProductQueryFilters) =>
    useQuery({
      queryKey: ["admin-products", filters],
      queryFn: () => productApi.adminGetProducts(filters),
    });

  // Query: Get single product detail
  const useGetProduct = (idOrSlug: string, enabled = true) =>
    useQuery({
      queryKey: ["product", idOrSlug],
      queryFn: () => productApi.getProduct(idOrSlug),
      enabled: !!idOrSlug && enabled,
    });

  // Mutation: Create product
  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productApi.adminCreateProduct(data),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo sản phẩm thành công! 🎉");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Tạo sản phẩm thất bại";
      toast.error(message);
    },
  });

  // Mutation: Update product
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productApi.adminUpdateProduct(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || "Cập nhật sản phẩm thành công! 🎉");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Cập nhật sản phẩm thất bại";
      toast.error(message);
    },
  });

  // Mutation: Delete product
  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productApi.adminDeleteProduct(id),
    onSuccess: (response) => {
      toast.success(response.message || "Xóa sản phẩm thành công! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Xóa sản phẩm thất bại";
      toast.error(message);
    },
  });

  return {
    useGetProducts,
    useGetProductsInfinite,
    useGetFeaturedProducts,
    useAdminGetProducts,
    useGetProduct,
    createProduct: createProductMutation,
    updateProduct: updateProductMutation,
    deleteProduct: deleteProductMutation,
  };
};

export default useProduct;
