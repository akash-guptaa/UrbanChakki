import { storage } from './storage';
import { Delivery, DeliveryStatus, DeliveryEvent } from '../types';

export const deliveryService = {
  getDeliveries: (): Delivery[] => {
    return storage.get<Delivery[]>('deliveries') || [];
  },

  getDeliveryByOrder: (orderId: string): Delivery | null => {
    const deliveries = deliveryService.getDeliveries();
    return deliveries.find(d => d.orderId === orderId) || null;
  },

  createDelivery: (orderId: string, userId: string, addressId: string | null, address: any): Delivery => {
    const deliveries = deliveryService.getDeliveries();
    
    // Check if already exists
    const existing = deliveries.find(d => d.orderId === orderId);
    if (existing) return existing;

    const newDelivery: Delivery = {
      id: 'del_' + Date.now(),
      orderId,
      userId,
      status: 'NOT_ASSIGNED',
      assignedTo: null,
      addressId,
      address,
      scheduledDate: new Date().toISOString().split('T')[0], // Today
      estimatedTime: '10:00-18:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deliveries.push(newDelivery);
    storage.set('deliveries', deliveries);
    
    deliveryService.logEvent(newDelivery.id, 'NOT_ASSIGNED', 'NOT_ASSIGNED', 'system', 'Delivery created');
    return newDelivery;
  },

  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus, changedBy: string, note: string = '') => {
    const deliveries = deliveryService.getDeliveries();
    const idx = deliveries.findIndex(d => d.id === deliveryId);
    if (idx === -1) return;

    const oldStatus = deliveries[idx].status;
    deliveries[idx].status = status;
    deliveries[idx].updatedAt = new Date().toISOString();
    
    storage.set('deliveries', deliveries);
    deliveryService.logEvent(deliveryId, oldStatus, status, changedBy, note);
  },

  assignDelivery: (deliveryId: string, assignedTo: string, changedBy: string) => {
    const deliveries = deliveryService.getDeliveries();
    const idx = deliveries.findIndex(d => d.id === deliveryId);
    if (idx === -1) return;

    deliveries[idx].assignedTo = assignedTo;
    const oldStatus = deliveries[idx].status;
    deliveries[idx].status = 'ASSIGNED';
    deliveries[idx].updatedAt = new Date().toISOString();
    
    storage.set('deliveries', deliveries);
    deliveryService.logEvent(deliveryId, oldStatus, 'ASSIGNED', changedBy, `Assigned to ${assignedTo}`);
  },

  logEvent: (deliveryId: string, fromStatus: DeliveryStatus, toStatus: DeliveryStatus, changedBy: string, note: string) => {
    const events = storage.get<DeliveryEvent[]>('delivery_events') || [];
    events.push({
      id: 'del_evt_' + Date.now(),
      deliveryId,
      fromStatus,
      toStatus,
      changedBy,
      note,
      createdAt: new Date().toISOString()
    });
    storage.set('delivery_events', events);
  },

  getDeliveryHistory: (deliveryId: string): DeliveryEvent[] => {
    const events = storage.get<DeliveryEvent[]>('delivery_events') || [];
    return events.filter(e => e.deliveryId === deliveryId);
  }
};
