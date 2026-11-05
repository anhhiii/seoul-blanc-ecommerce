import fs from 'fs';
import path from 'path';

export interface WalletTransaction {
  id: string;
  orderId?: string;
  orderCode?: string;
  amount: number;
  type: 'REFUND_CANCEL' | 'REFUND_RETURN' | 'USAGE';
  description: string;
  createdAt: string;
}

export interface UserWallet {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export class WalletService {
  private filePath: string;
  private wallets: Record<string, UserWallet> = {};

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'wallets.json');
    this.loadWallets();
  }

  private loadWallets() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.wallets = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load wallets.json:', err);
      this.wallets = {};
    }
  }

  private saveWallets() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.wallets, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save wallets.json:', err);
    }
  }

  public getWallet(userId: string): UserWallet {
    if (!this.wallets[userId]) {
      this.wallets[userId] = {
        userId,
        balance: 0,
        transactions: [],
      };
      this.saveWallets();
    }
    return this.wallets[userId];
  }

  public creditRefund(
    userId: string,
    amount: number,
    orderId: string,
    orderCode: string,
    description: string,
    type: 'REFUND_CANCEL' | 'REFUND_RETURN' = 'REFUND_CANCEL'
  ): UserWallet {
    const wallet = this.getWallet(userId);
    wallet.balance += Math.max(0, amount);
    const tx: WalletTransaction = {
      id: `WTX_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      orderCode,
      amount: Math.max(0, amount),
      type,
      description,
      createdAt: new Date().toISOString(),
    };
    wallet.transactions.unshift(tx);
    this.saveWallets();
    return wallet;
  }

  public debitWallet(
    userId: string,
    amount: number,
    orderId: string,
    orderCode: string,
    description: string
  ): UserWallet {
    const wallet = this.getWallet(userId);
    const deduct = Math.min(wallet.balance, Math.max(0, amount));
    wallet.balance -= deduct;
    const tx: WalletTransaction = {
      id: `WTX_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      orderId,
      orderCode,
      amount: -deduct,
      type: 'USAGE',
      description,
      createdAt: new Date().toISOString(),
    };
    wallet.transactions.unshift(tx);
    this.saveWallets();
    return wallet;
  }
}

export const walletService = new WalletService();
export default walletService;

