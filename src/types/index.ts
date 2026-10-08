export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  weight: number;
  unit: string;
  price: number;
  sku: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  variants: ProductVariant[];
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullAddress: string;
  building: string;
  roomNumber: string;
  landmark: string;
  locationType: string;
  latitude: number | null;
  longitude: number | null;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;
  variantName: string;
}

export interface OrderSchedule {
  type: 'ONE_TIME' | 'WEEKLY' | 'EVERY_15_DAYS' | 'MONTHLY' | 'CUSTOM';
  customDays?: number;
  startDate?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Address | null;
  orderType: OrderSchedule['type'];
  schedule: OrderSchedule;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'PAYMENT_REQUIRED' | 'REFUNDED';
  paymentMethod: 'WALLET' | 'CASH' | 'ONLINE';
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: string;
  timestamp: string;
  note: string;
}

export interface Subscription {
  id: string;
  userId: string;
  orderId: string;
  frequencyType: OrderSchedule['type'];
  frequencyValue: number;
  startDate: string;
  nextDeliveryDate: string;
  paymentMethod: string;
  paymentStatus: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  items: OrderItem[]; // Copy items here to create recurring orders easily
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'TOP_UP' | 'ORDER_PAYMENT' | 'REFUND';
  direction: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  orderId: string | null;
  status: 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface AnalyticsEvent {
  eventId: string;
  eventName: string;
  timestamp: string;
  sessionId: string;
  userId: string | null;
  page: string;
  productId?: string;
  variantId?: string;
  quantity?: number;
  metadata: any;
}

// ---- PHASE 2 NEW TYPES ----

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface InventoryItem {
  id: string;
  variantId: string;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
  status: InventoryStatus;
  updatedAt: string;
}

export interface InventoryTransaction {
  id: string;
  variantId: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ORDER_RESERVED' | 'ORDER_RELEASED' | 'ORDER_CONSUMED' | 'MANUAL_ADJUSTMENT' | 'RETURN' | 'DAMAGED';
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  changedBy: string;
  createdAt: string;
}

export type DeliveryStatus = 'NOT_ASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'RESCHEDULED' | 'CANCELLED';

export interface Delivery {
  id: string;
  orderId: string;
  userId: string;
  status: DeliveryStatus;
  assignedTo: string | null;
  addressId: string | null;
  address?: Address | null; // Denormalized for ease
  scheduledDate: string;
  estimatedTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryEvent {
  id: string;
  deliveryId: string;
  fromStatus: DeliveryStatus;
  toStatus: DeliveryStatus;
  changedBy: string;
  note: string;
  createdAt: string;
}

export interface AdminEvent {
  id: string;
  adminId: string;
  action: string;
  entityType: 'ORDER' | 'INVENTORY' | 'DELIVERY' | 'CUSTOMER' | 'SUBSCRIPTION';
  entityId: string;
  metadata: any;
  createdAt: string;
}
