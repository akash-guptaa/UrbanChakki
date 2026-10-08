import { storage } from './storage';
import { AnalyticsEvent } from '../types';
import { authService } from './auth';

export const analytics = {
  track: (eventName: string, metadata: any = {}) => {
    const events = storage.get<AnalyticsEvent[]>('analytics_events') || [];
    const user = authService.getCurrentUser();
    
    const event: AnalyticsEvent = {
      eventId: 'evt_' + Math.random().toString(36).substr(2, 9),
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: 'session_demo',
      userId: user?.id || null,
      page: window.location.pathname,
      metadata
    };
    
    // Add product IDs explicitly if passed in metadata
    if (metadata.productId) event.productId = metadata.productId;
    if (metadata.variantId) event.variantId = metadata.variantId;
    if (metadata.quantity) event.quantity = metadata.quantity;
    
    events.push(event);
    storage.set('analytics_events', events);
  },
  
  getEvents: (): AnalyticsEvent[] => {
    return storage.get<AnalyticsEvent[]>('analytics_events') || [];
  }
};
