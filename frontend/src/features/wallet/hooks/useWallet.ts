import { useQuery } from '@tanstack/react-query';
import walletApi from '../api/wallet.api.js';
import { useAuthStore } from '../../../store/authStore.js';

export const useWallet = () => {
  const { isAuthenticated } = useAuthStore();

  const useGetWallet = () =>
    useQuery({
      queryKey: ['wallet'],
      queryFn: async () => {
        const res = await walletApi.getWallet();
        return res.data?.wallet || { userId: '', balance: 0, transactions: [] };
      },
      enabled: isAuthenticated,
      staleTime: 1000 * 30, // 30s
    });

  return {
    useGetWallet,
  };
};

export default useWallet;

