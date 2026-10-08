import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi';
import { cartService } from '../services/cart';
import { authService } from '../services/auth';
import { useState, useEffect } from 'react';
import type { User } from '../types';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateState = () => {
      const items = cartService.getCart();
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      setUser(authService.getCurrentUser());
    };
    updateState();
    window.addEventListener('storage', updateState);
    window.addEventListener('cart_updated', updateState);
    window.addEventListener('auth_updated', updateState);
    return () => {
      window.removeEventListener('storage', updateState);
      window.removeEventListener('cart_updated', updateState);
      window.removeEventListener('auth_updated', updateState);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              Urban Chakki
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-primary font-medium">Products</Link>
            <Link to="/orders" className="text-gray-700 hover:text-primary font-medium">Orders</Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/account" className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-primary">
                  <FiUser size={20} />
                  <span className="font-medium text-sm">Hi, {user.name.split(' ')[0]}</span>
                </Link>
                {user.phone === '7400422743' && (
                  <Link to="/admin" className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-md hover:bg-primary/90">
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2" title="Logout">
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-primary font-bold hover:underline">
                Login
              </Link>
            )}
            
            <Link to="/cart" className="text-gray-700 hover:text-primary p-2 relative ml-2 border-l pl-4">
              <FiShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-error rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
