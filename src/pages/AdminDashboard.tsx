import { useEffect, useState } from 'react';
import { orderService } from '../services/orders';
import { deliveryService } from '../services/delivery';
import { inventoryService } from '../services/inventory';
import { Order, Delivery, InventoryItem } from '../types';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setOrders(orderService.getOrders());
    setDeliveries(deliveryService.getDeliveries());
    setInventory(inventoryService.getInventory());
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  
  const todayDeliveries = deliveries.filter(d => d.scheduledDate === today);
  const outForDelivery = todayDeliveries.filter(d => d.status === 'OUT_FOR_DELIVERY').length;
  

  const lowStock = inventory.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');
  const healthyStock = inventory.filter(i => i.status === 'IN_STOCK');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Admin</h1>
        <p className="text-gray-500">Here's what's happening with Urban Chakki today.</p>
      </div>

      {/* TODAY */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wide">Today's Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Orders</p>
            <p className="text-3xl font-bold text-primary mt-1">{todayOrders.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-1">₹{todayRevenue}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Pending Orders</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">{pendingOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Out for Delivery</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">{outForDelivery}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* INVENTORY */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Inventory Alerts</h2>
            <Link to="/admin/inventory" className="text-sm text-primary hover:underline">Manage Inventory</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {lowStock.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {lowStock.map(item => (
                  <li key={item.id} className="p-4 flex justify-between items-center bg-red-50">
                    <div>
                      <p className="font-bold text-gray-900">{item.variantId}</p>
                      <p className="text-sm text-gray-600">Available: <span className="font-bold text-red-600">{item.stock - item.reserved}</span></p>
                    </div>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">{item.status.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p>All {healthyStock.length} items are healthy.</p>
              </div>
            )}
          </div>
        </section>

        {/* TODAY'S ORDERS PREVIEW */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-bold text-gray-900">{order.id} <span className="text-sm font-normal text-gray-500 ml-2">₹{order.total}</span></p>
                  <p className="text-sm text-gray-600">{order.items[0].productName} x{order.items[0].quantity} {order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-bold">{order.status}</span>
              </div>
            ))}
            {orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
