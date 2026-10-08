import { storage } from './storage';
import { CartItem, Product, ProductVariant } from '../types';
import { analytics } from './analytics';

export const cartService = {
  getCart: (): CartItem[] => {
    return storage.get<CartItem[]>('cart') || [];
  },
  addItem: (product: Product, variant: ProductVariant, quantity: number) => {
    const cart = cartService.getCart();
    const existing = cart.find(item => item.variantId === variant.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: Math.random().toString(36).substring(7),
        productId: product.id,
        variantId: variant.id,
        quantity,
        product,
        variant
      });
    }
    storage.set('cart', cart);
    analytics.track('add_to_cart', { productId: product.id, variantId: variant.id, quantity });
  },
  updateQuantity: (id: string, quantity: number) => {
    let cart = cartService.getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      if (quantity > item.quantity) {
        analytics.track('quantity_increased', { productId: item.productId, variantId: item.variantId, quantity });
      } else if (quantity < item.quantity) {
        analytics.track('quantity_decreased', { productId: item.productId, variantId: item.variantId, quantity });
      }
      item.quantity = quantity;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
        analytics.track('remove_from_cart', { productId: item.productId, variantId: item.variantId });
      }
      storage.set('cart', cart);
    }
  },
  removeItem: (id: string) => {
    let cart = cartService.getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      analytics.track('remove_from_cart', { productId: item.productId, variantId: item.variantId });
    }
    cart = cart.filter(i => i.id !== id);
    storage.set('cart', cart);
  },
  clearCart: () => {
    storage.remove('cart');
  },
  getSubtotal: (): number => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => total + item.variant.price * item.quantity, 0);
  },
  getTotal: (): number => {
    // adding a dummy 50 delivery fee if subtotal > 0
    const subtotal = cartService.getSubtotal();
    return subtotal > 0 ? subtotal + 50 : 0;
  }
};
