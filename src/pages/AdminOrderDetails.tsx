import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/orders';
import { deliveryService } from '../services/delivery';
import { adminService } from '../services/admin';
import { Order, Delivery, OrderStatusHistory, OrderStatus } from '../types';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);

  useEffect(() => {
    if (!id) return;
    const o = orderService.getOrder(id);
    if (!o) return;
    setOrder(o);
    setDelivery(deliveryService.getDeliveryByOrder(id));
    setHistory(adminService.getOrderStatusHistory(id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [id]);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-700">Order Not Found</h2>
        <p className="text-gray-500 mt-2">The order you are looking for does not exist or has been deleted.</p>
        <button onClick={() => navigate('/admin/orders')} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">Back to Orders</button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    orderService.updateOrderStatus(order.id, newStatus, undefined, 'admin');
    setOrder(orderService.getOrder(order.id));
    setHistory(adminService.getOrderStatusHistory(order.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/orders" className="text-gray-500 hover:text-gray-900">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-900">Order {order.id}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-500">{item.variantName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{item.unitPrice} x {item.quantity}</p>
                    <p className="text-sm text-gray-500">₹{item.subtotal}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-4 text-right space-y-1">
                <p className="text-gray-600">Subtotal: ₹{order.subtotal}</p>
                <p className="text-gray-600">Delivery: ₹{order.deliveryFee}</p>
                <p className="text-lg font-bold text-gray-900">Total: ₹{order.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Delivery Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">Address</p>
                <p className="text-gray-900">{order.address?.building}, {order.address?.roomNumber}</p>
                <p className="text-gray-600 text-sm">{order.address?.landmark}</p>
                <p className="text-gray-600 text-sm">{order.address?.locationType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-bold mb-1">Delivery Status</p>
                <p className="text-gray-900 font-medium">{delivery?.status || 'Not created'}</p>
                <p className="text-sm text-gray-500 mt-2">Assigned To: {delivery?.assignedTo || 'Unassigned'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Management</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Change Order Status</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={order.status}
                  onChange={e => handleStatusChange(e.target.value as OrderStatus)}
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
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Status</label>
                <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {order.paymentMethod} - {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Timeline</h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {history.map((h) => (
                <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white bg-primary text-slate-500 group-[.is-active]:text-emerald-50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow"></div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-xs">{h.toStatus}</div>
                      <time className="font-caveat font-medium text-indigo-500 text-xs">{new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</time>
                    </div>
                    <div className="text-slate-500 text-xs">{h.changedBy === 'system' ? 'System' : 'Admin'}</div>
                  </div>
                </div>
              ))}
              {history.length === 0 && <div className="text-sm text-gray-500 text-center">No timeline events found.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
