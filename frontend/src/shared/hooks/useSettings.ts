/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import settingsApi, { type SystemSettings } from '../api/settings.api.js';

export const DEFAULT_SETTINGS: SystemSettings = {
  storeName: 'Seoul Blanc',
  tagline: 'Korean Minimalist Fashion Ecommerce',
  supportEmail: 'support@seoulblanc.com',
  hotline: '1900 8888',
  address: 'Hà Nội & TP. Hồ Chí Minh, Việt Nam',
  freeShippingThreshold: 1000000,
  standardShippingFee: 30000,
};

export const useSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const res = await settingsApi.getSettings();
        return res.data?.settings || DEFAULT_SETTINGS;
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => settingsApi.updateSettings(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Cập nhật cài đặt hệ thống thành công! ⚙️');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Không thể lưu cài đặt. Vui lòng thử lại!';
      toast.error(msg);
    },
  });

  return {
    settings: settingsQuery.data || DEFAULT_SETTINGS,
    isLoading: settingsQuery.isLoading,
    updateSettings: updateSettingsMutation,
  };
};

export default useSettings;
