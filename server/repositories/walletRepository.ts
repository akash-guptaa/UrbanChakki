import { BaseRepository } from './BaseRepository';

export class WalletRepository extends BaseRepository<any> {
  constructor() {
    super('wallet/wallets.json');
  }
}
export const walletRepository = new WalletRepository();
