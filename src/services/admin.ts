import { storage } from './storage';
import { AdminEvent, OrderStatusHistory } from '../types';

export const adminService = {
  logAdminAction: (
    adminId: string, 
    action: string, 
    entityType: AdminEvent['entityType'], 
    entityId: string, 
    metadata: any = {}
  ) => {
    const events = storage.get<AdminEvent[]>('admin_events') || [];
    const newEvent: AdminEvent = {
      id: 'admin_event_' + Date.now(),
      adminId,
      action,
      entityType,
      entityId,
      metadata,
      createdAt: new Date().toISOString()
    };
    events.push(newEvent);
    storage.set('admin_events', events);
  },

  getAdminActivity: (): AdminEvent[] => {
    return storage.get<AdminEvent[]>('admin_events') || [];
  },

  logOrderStatusChange: (
    orderId: string,
    fromStatus: any,
    toStatus: any,
    changedBy: string,
    note: string = ''
  ) => {
    const history = storage.get<OrderStatusHistory[]>('order_status_history') || [];
    const newHistory: OrderStatusHistory = {
      id: 'status_' + Date.now(),
      orderId,
      fromStatus,
      toStatus,
      changedBy,
      timestamp: new Date().toISOString(),
      note
    };
    history.push(newHistory);
    storage.set('order_status_history', history);
  },

  getOrderStatusHistory: (orderId: string): OrderStatusHistory[] => {
    const history = storage.get<OrderStatusHistory[]>('order_status_history') || [];
    return history.filter(h => h.orderId === orderId);
  }
};
