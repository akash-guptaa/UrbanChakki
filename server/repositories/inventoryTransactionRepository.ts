import { BaseRepository } from './BaseRepository';

export class InventoryTransactionRepository extends BaseRepository<any> {
  constructor() {
    super('inventory/inventory-transactions.json');
  }
}
export const inventoryTransactionRepository = new InventoryTransactionRepository();
