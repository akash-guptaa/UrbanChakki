import { storage } from './storage';
import { Order, Subscription, CartItem, Address, OrderSchedule, OrderStatus } from '../types';
import { analytics } from './analytics';
import { inventoryService } from './inventory';
import { deliveryService } from './delivery';
import { adminService } from './admin';

export const orderService = {
  getOrders: (userId?: string): Order[] => {
    const all = storage.get<Order[]>('orders') || [];
    if (userId) {
      return all.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrder: (id: string): Order | null => {
    const all = storage.get<Order[]>('orders') || [];
    return all.find(o => o.id === id) || null;
  },

  createOrder: (
    userId: string, 
    cartItems: CartItem[], 
    address: Address, 
    schedule: OrderSchedule,
    subtotal: number,
    deliveryFee: number,
    total: number,
    paymentMethod: 'WALLET' | 'CASH' | 'ONLINE'
  ): Order => {
    // 1. Check Inventory
    for (const item of cartItems) {
      const available = inventoryService.getAvailableStock(item.variantId);
      if (available < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name} (${item.variant.name})`);
      }
    }

    const orderId = 'ORD-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // 2. Reserve Inventory
    for (const item of cartItems) {
      inventoryService.reserveStock(item.variantId, item.quantity, orderId);
    }

    const order: Order = {
      id: orderId,
      userId,
      items: cartItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: item.variant.price,
        subtotal: item.variant.price * item.quantity,
        productName: item.product.name,
        variantName: item.variant.name
      })),
      address,
      orderType: schedule.type,
      schedule,
      subtotal,
      deliveryFee,
      total,
      paymentStatus: 'PENDING',
      paymentMethod,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const orders = storage.get<Order[]>('orders') || [];
    orders.push(order);
    storage.set('orders', orders);
    
    adminService.logOrderStatusChange(orderId, null, 'PENDING', userId, 'Order placed');
    
    // Create Delivery Record
    deliveryService.createDelivery(orderId, userId, address?.id || null, address);

    if (schedule.type !== 'ONE_TIME') {
      const subId = 'SUB-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      let nextDate = new Date();
      if (schedule.type === 'WEEKLY') nextDate.setDate(nextDate.getDate() + 7);
      if (schedule.type === 'EVERY_15_DAYS') nextDate.setDate(nextDate.getDate() + 15);
      if (schedule.type === 'MONTHLY') nextDate.setMonth(nextDate.getMonth() + 1);
      if (schedule.type === 'CUSTOM') nextDate.setDate(nextDate.getDate() + (schedule.customDays || 1));

      const sub: Subscription = {
        id: subId,
        userId,
        orderId,
        frequencyType: schedule.type,
        frequencyValue: schedule.customDays || 0,
        startDate: new Date().toISOString(),
        nextDeliveryDate: nextDate.toISOString(),
        paymentMethod,
        paymentStatus: 'ACTIVE',
        status: 'ACTIVE',
        items: [...order.items]
      };
      
      const subs = storage.get<Subscription[]>('subscriptions') || [];
      subs.push(sub);
      storage.set('subscriptions', subs);
    }

    analytics.track('order_placed', { orderId, total, paymentMethod });
    return order;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus'], changedBy: string = 'system') => {
    const orders = storage.get<Order[]>('orders') || [];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return;

    const oldStatus = orders[idx].status;
    orders[idx].status = status;
    if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
    orders[idx].updatedAt = new Date().toISOString();
    
    storage.set('orders', orders);
    adminService.logOrderStatusChange(orderId, oldStatus, status, changedBy);

    // If Cancelled, release stock
    if (status === 'CANCELLED') {
      const order = orders[idx];
      order.items.forEach(item => {
        inventoryService.releaseStock(item.variantId, item.quantity, orderId);
      });
      const del = deliveryService.getDeliveryByOrder(orderId);
      if (del && del.status !== 'CANCELLED' && del.status !== 'DELIVERED') {
        deliveryService.updateDeliveryStatus(del.id, 'CANCELLED', changedBy, 'Order cancelled');
      }
    }

    // If Delivered, consume stock
    if (status === 'DELIVERED') {
      const order = orders[idx];
      order.items.forEach(item => {
        inventoryService.consumeStock(item.variantId, item.quantity, orderId);
      });
      const del = deliveryService.getDeliveryByOrder(orderId);
      if (del && del.status !== 'DELIVERED') {
        deliveryService.updateDeliveryStatus(del.id, 'DELIVERED', changedBy, 'Order marked delivered');
      }
    }

    // Sync other statuses to delivery
    if (status === 'OUT_FOR_DELIVERY') {
      const del = deliveryService.getDeliveryByOrder(orderId);
      if (del && del.status !== 'OUT_FOR_DELIVERY') {
        deliveryService.updateDeliveryStatus(del.id, 'OUT_FOR_DELIVERY', changedBy, 'Order marked out for delivery');
      }
    }
    if (status === 'FAILED') {
      const del = deliveryService.getDeliveryByOrder(orderId);
      if (del && del.status !== 'FAILED') {
        deliveryService.updateDeliveryStatus(del.id, 'FAILED', changedBy, 'Order failed');
      }
    }
  },

  getSubscriptions: (userId?: string): Subscription[] => {
    const all = storage.get<Subscription[]>('subscriptions') || [];
    if (userId) return all.filter(s => s.userId === userId);
    return all;
  },

  updateSubscription: (subId: string, updates: Partial<Subscription>) => {
    const subs = storage.get<Subscription[]>('subscriptions') || [];
    const idx = subs.findIndex(s => s.id === subId);
    if (idx !== -1) {
      subs[idx] = { ...subs[idx], ...updates };
      storage.set('subscriptions', subs);
    }
  }
};
