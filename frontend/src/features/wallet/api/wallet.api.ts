import apiClient from '../../../shared/services/apiClient.js';

export interface WalletTransaction {
  id: string;
  orderId?: string;
  orderCode?: string;
  amount: number;
  type: 'REFUND_CANCEL' | 'REFUND_RETURN' | 'USAGE';
  description: string;
  createdAt: string;
}

export interface WalletData {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export const walletApi = {
  getWallet: () => apiClient.get<any, { success: boolean; data: { wallet: WalletData } }>('/wallet'),
};

export default walletApi;
