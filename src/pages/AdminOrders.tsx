import { useState, useEffect } from 'react';
import { orderService } from '../services/orders';
import { Order, OrderStatus } from '../types';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    setOrders(orderService.getOrders());
  }, []);

  const filteredOrders = orders.filter(o => {
    if (filter === 'All') return true;
    if (filter === 'Today') return o.createdAt.startsWith(new Date().toISOString().split('T')[0]);
    return o.status === filter;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    orderService.updateOrderStatus(orderId, newStatus, undefined, 'admin');
    setOrders(orderService.getOrders()); // refresh
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select 
          className="p-2 border border-gray-300 rounded-md"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Orders</option>
          <option value="Today">Today's Orders</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b text-gray-900 font-bold">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Products</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{order.id}</td>
                  <td className="p-4">{order.address?.building}, {order.address?.roomNumber}</td>
                  <td className="p-4">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.productName} ({item.variantName}) x{item.quantity}</div>
                    ))}
                  </td>
                  <td className="p-4 font-bold">₹{order.total}</td>
                  <td className="p-4">{order.orderType}</td>
                  <td className="p-4">
                    <select 
                      className="p-1 border rounded text-xs"
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">View</Link>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
