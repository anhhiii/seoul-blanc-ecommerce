/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../../shared/services/apiClient.js";
import type {
  AddressesResponse,
  AddressResponse,
  CreateAddressInput,
  UpdateAddressInput,
} from "../types/index.js";

export const addressApi = {
  /**
   * Get all addresses of user
   */
  getAddresses: () =>
    apiClient.get<any, AddressesResponse>("/addresses"),

  /**
   * Get detail of an address by ID
   */
  getAddressById: (id: string) =>
    apiClient.get<any, AddressResponse>(`/addresses/${id}`),

  /**
   * Create a new address
   */
  createAddress: (data: CreateAddressInput) =>
    apiClient.post<any, AddressResponse>("/addresses", data),

  /**
   * Update an existing address
   */
  updateAddress: (id: string, data: UpdateAddressInput) =>
    apiClient.put<any, AddressResponse>(`/addresses/${id}`, data),

  /**
   * Delete an address
   */
  deleteAddress: (id: string) =>
    apiClient.delete<any, { success: boolean; message: string }>(`/addresses/${id}`),

  /**
   * Set address as default
   */
  setDefaultAddress: (id: string) =>
    apiClient.put<any, AddressResponse>(`/addresses/${id}/set-default`),
};

export default addressApi;
