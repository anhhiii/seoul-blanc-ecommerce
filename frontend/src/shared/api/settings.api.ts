/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from '../services/apiClient.js';

export interface SystemSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  hotline: string;
  address: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  updatedAt?: string;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data: {
    settings: SystemSettings;
  };
}

export const settingsApi = {
  getSettings: () => apiClient.get<any, SettingsResponse>('/settings'),
  updateSettings: (data: Partial<SystemSettings>) =>
    apiClient.put<any, SettingsResponse>('/admin/settings', data),
};

export default settingsApi;

