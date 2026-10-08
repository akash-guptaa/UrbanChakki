import { Link } from 'react-router-dom';
import { walletService } from '../services/wallet';
import { orderService } from '../services/orders';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Account() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  const currentUserId = user?.id || '';
  const balance = walletService.getBalance(currentUserId);
  const orders = orderService.getOrders(currentUserId);
  const subs = orderService.getSubscriptions(currentUserId);

  const totalSpent = orders.filter(o => o.paymentStatus === 'PAID').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hello, {user?.name.split(' ')[0] || 'User'} 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 mb-2">Wallet Balance</h2>
          <p className="text-4xl font-bold text-primary mb-4">₹{balance}</p>
          <Link to="/account/wallet" className="text-primary font-medium hover:underline">Manage Wallet →</Link>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-gray-500 mb-2">Total Spent</h2>
          <p className="text-4xl font-bold text-gray-900 mb-4">₹{totalSpent}</p>
          <p className="text-sm text-gray-500">{orders.length} Total Orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/orders" className="bg-white p-4 rounded-lg shadow-sm border hover:border-primary text-center font-bold">My Orders ({orders.length})</Link>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center font-bold">Subscriptions ({subs.length})</div>
        <Link to="/products" className="bg-primary text-white p-4 rounded-lg shadow-sm text-center font-bold hover:bg-primary/90">Shop Now</Link>
      </div>
    </div>
  );
}
