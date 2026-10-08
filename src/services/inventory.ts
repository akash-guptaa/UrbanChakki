import { storage } from './storage';
import { InventoryItem, InventoryTransaction, InventoryStatus } from '../types';

export const inventoryService = {
  getInventory: (): InventoryItem[] => {
    return storage.get<InventoryItem[]>('inventory') || [];
  },

  getInventoryByVariant: (variantId: string): InventoryItem | null => {
    const inv = inventoryService.getInventory();
    return inv.find(i => i.variantId === variantId) || null;
  },

  getAvailableStock: (variantId: string): number => {
    const item = inventoryService.getInventoryByVariant(variantId);
    if (!item) return Infinity; // If no inventory tracked, assume unlimited for phase 1 products until seeded
    return item.stock - item.reserved;
  },

  calculateStatus: (stock: number, reserved: number, threshold: number): InventoryStatus => {
    const available = stock - reserved;
    if (available <= 0) return 'OUT_OF_STOCK';
    if (available <= threshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  },

  logTransaction: (
    variantId: string,
    type: InventoryTransaction['type'],
    quantity: number,
    stockBefore: number,
    stockAfter: number,
    reason: string,
    changedBy: string
  ) => {
    const transactions = storage.get<InventoryTransaction[]>('inventory_transactions') || [];
    transactions.push({
      id: 'inv_txn_' + Date.now(),
      variantId,
      type,
      quantity,
      stockBefore,
      stockAfter,
      reason,
      changedBy,
      createdAt: new Date().toISOString()
    });
    storage.set('inventory_transactions', transactions);
  },

  initializeItem: (variantId: string, initialStock: number = 100) => {
    const inv = inventoryService.getInventory();
    if (inv.find(i => i.variantId === variantId)) return;
    
    inv.push({
      id: 'inv_' + variantId,
      variantId,
      stock: initialStock,
      reserved: 0,
      lowStockThreshold: 25,
      status: 'IN_STOCK',
      updatedAt: new Date().toISOString()
    });
    storage.set('inventory', inv);
    inventoryService.logTransaction(variantId, 'STOCK_IN', initialStock, 0, initialStock, 'Initial stock', 'system');
  },

  reserveStock: (variantId: string, quantity: number, orderId: string): boolean => {
    const inv = inventoryService.getInventory();
    let item = inv.find(i => i.variantId === variantId);
    
    if (!item) {
      inventoryService.initializeItem(variantId);
      return inventoryService.reserveStock(variantId, quantity, orderId);
    }

    if (item.stock - item.reserved < quantity) return false;

    item.reserved += quantity;
    item.status = inventoryService.calculateStatus(item.stock, item.reserved, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();
    
    storage.set('inventory', inv);
    inventoryService.logTransaction(variantId, 'ORDER_RESERVED', quantity, item.stock, item.stock, `Reserved for order ${orderId}`, 'system');
    return true;
  },

  releaseStock: (variantId: string, quantity: number, orderId: string) => {
    const inv = inventoryService.getInventory();
    const item = inv.find(i => i.variantId === variantId);
    if (!item) return;

    item.reserved = Math.max(0, item.reserved - quantity);
    item.status = inventoryService.calculateStatus(item.stock, item.reserved, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();
    
    storage.set('inventory', inv);
    inventoryService.logTransaction(variantId, 'ORDER_RELEASED', quantity, item.stock, item.stock, `Released for order ${orderId}`, 'system');
  },

  consumeStock: (variantId: string, quantity: number, orderId: string) => {
    const inv = inventoryService.getInventory();
    const item = inv.find(i => i.variantId === variantId);
    if (!item) return;

    item.stock = Math.max(0, item.stock - quantity);
    item.reserved = Math.max(0, item.reserved - quantity);
    item.status = inventoryService.calculateStatus(item.stock, item.reserved, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();
    
    storage.set('inventory', inv);
    inventoryService.logTransaction(variantId, 'ORDER_CONSUMED', quantity, item.stock + quantity, item.stock, `Consumed by order ${orderId}`, 'system');
  },

  addStock: (variantId: string, quantity: number, reason: string, changedBy: string) => {
    const inv = inventoryService.getInventory();
    let item = inv.find(i => i.variantId === variantId);
    if (!item) {
      inventoryService.initializeItem(variantId, quantity);
      return;
    }

    const stockBefore = item.stock;
    item.stock += quantity;
    item.status = inventoryService.calculateStatus(item.stock, item.reserved, item.lowStockThreshold);
    item.updatedAt = new Date().toISOString();
    
    storage.set('inventory', inv);
    inventoryService.logTransaction(variantId, 'STOCK_IN', quantity, stockBefore, item.stock, reason, changedBy);
  }
};
