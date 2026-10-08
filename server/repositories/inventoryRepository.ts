import { BaseRepository } from './BaseRepository';

export class InventoryRepository extends BaseRepository<any> {
  constructor() {
    super('inventory/inventory.json');
  }
}
export const inventoryRepository = new InventoryRepository();
