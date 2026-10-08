import { storage } from './storage';
import { WalletTransaction } from '../types';
import { analytics } from './analytics';

export const walletService = {
  getTransactions: (userId: string): WalletTransaction[] => {
    const all = storage.get<WalletTransaction[]>('wallet_transactions') || [];
    return all.filter(t => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getBalance: (userId: string): number => {
    const txns = walletService.getTransactions(userId);
    if (txns.length === 0) return 0;
    return txns[0].balanceAfter;
  },
  addMoney: (userId: string, amount: number) => {
    if (amount <= 0) throw new Error('Amount must be positive');
    const balanceBefore = walletService.getBalance(userId);
    const balanceAfter = balanceBefore + amount;
    const txn: WalletTransaction = {
      id: 'txn_' + Math.random().toString(36).substring(7),
      userId,
      type: 'TOP_UP',
      direction: 'CREDIT',
      amount,
      balanceBefore,
      balanceAfter,
      description: 'Wallet top-up',
      orderId: null,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };
    const all = storage.get<WalletTransaction[]>('wallet_transactions') || [];
    all.push(txn);
    storage.set('wallet_transactions', all);
    analytics.track('wallet_topup_completed', { amount });
  },
  debit: (userId: string, amount: number, options: { orderId: string; description: string }) => {
    if (amount <= 0) throw new Error('Amount must be positive');
    const balanceBefore = walletService.getBalance(userId);
    if (balanceBefore < amount) throw new Error('Insufficient balance');
    
    const balanceAfter = balanceBefore - amount;
    const txn: WalletTransaction = {
      id: 'txn_' + Math.random().toString(36).substring(7),
      userId,
      type: 'ORDER_PAYMENT',
      direction: 'DEBIT',
      amount,
      balanceBefore,
      balanceAfter,
      description: options.description,
      orderId: options.orderId,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };
    const all = storage.get<WalletTransaction[]>('wallet_transactions') || [];
    all.push(txn);
    storage.set('wallet_transactions', all);
    analytics.track('wallet_payment_completed', { amount, orderId: options.orderId });
  },
  refund: (userId: string, amount: number, options: { orderId: string; description: string }) => {
    if (amount <= 0) throw new Error('Amount must be positive');
    const balanceBefore = walletService.getBalance(userId);
    const balanceAfter = balanceBefore + amount;
    const txn: WalletTransaction = {
      id: 'txn_' + Math.random().toString(36).substring(7),
      userId,
      type: 'REFUND',
      direction: 'CREDIT',
      amount,
      balanceBefore,
      balanceAfter,
      description: options.description,
      orderId: options.orderId,
      status: 'COMPLETED',
      createdAt: new Date().toISOString()
    };
    const all = storage.get<WalletTransaction[]>('wallet_transactions') || [];
    all.push(txn);
    storage.set('wallet_transactions', all);
    analytics.track('wallet_refund_received', { amount, orderId: options.orderId });
  }
};
