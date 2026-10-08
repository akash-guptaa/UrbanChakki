// InMemory Cache to allow synchronous reads for existing UI components
let memCache: Record<string, any> = {};

export const storage = {
  // Call this at the start of the app (App.tsx)
  init: async () => {
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        memCache = await response.json();
      }
    } catch (e) {
      console.error('Failed to initialize state from API', e);
    }
  },

  get: <T>(key: string): T | null => {
    return memCache[key] || null;
  },
  
  set: <T>(key: string, value: T): void => {
    memCache[key] = value;
    
    // Background sync to JSON API
    fetch(`/api/state/${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    }).catch(console.error);

    // Fire events for UI reactivity
    window.dispatchEvent(new Event('storage'));
    if (key === 'cart') window.dispatchEvent(new Event('cart_updated'));
    if (key === 'current_user' || key === 'current_user_id') window.dispatchEvent(new Event('auth_updated'));
  },

  remove: (key: string): void => {
    delete memCache[key];
    
    fetch(`/api/state/${key}`, {
      method: 'DELETE',
    }).catch(console.error);

    window.dispatchEvent(new Event('storage'));
    if (key === 'cart') window.dispatchEvent(new Event('cart_updated'));
  }
};
