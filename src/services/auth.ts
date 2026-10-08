import { storage } from './storage';
import { User } from '../types';

export const authService = {
  login: (name: string, phone: string): User => {
    let users = storage.get<User[]>('users') || [];
    let user = users.find(u => u.phone === phone);
    
    if (!user) {
      user = {
        id: 'user_' + Math.random().toString(36).substring(7),
        name,
        phone,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      storage.set('users', users);
    } else {
      // update name if changed
      user.name = name;
      storage.set('users', users);
    }
    
    storage.set('current_user', user);
    window.dispatchEvent(new Event('auth_updated'));
    return user;
  },
  
  logout: () => {
    storage.remove('current_user');
    window.dispatchEvent(new Event('auth_updated'));
  },

  getCurrentUser: (): User | null => {
    return storage.get<User>('current_user');
  }
};
