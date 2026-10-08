import { Link } from 'react-router-dom';
import { orderService } from '../services/orders';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Orders() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  const currentUserId = user?.id || '';
  const orders = orderService.getOrders(currentUserId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <p className="text-gray-500 mb-4">You have no orders yet.</p>
          <Link to="/products" className="text-primary font-bold hover:underline">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-bold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold">₹{order.total}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="font-medium text-gray-900">{item.productName} - {item.variantName} x {item.quantity}</p>
                  ))}
                  {order.orderType !== 'ONE_TIME' && (
                    <p className="text-sm text-primary mt-2 flex items-center gap-1">
                      ↻ Recurring: {order.orderType.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link to={`/orders/${order.id}`} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md font-bold text-sm transition-colors">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
