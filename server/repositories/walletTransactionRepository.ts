import { BaseRepository } from './BaseRepository';

export class WalletTransactionRepository extends BaseRepository<any> {
  constructor() {
    super('wallet/wallet-transactions.json');
  }
}
export const walletTransactionRepository = new WalletTransactionRepository();
