import { useState, useEffect } from 'react';
import { deliveryService } from '../services/delivery';
import { Delivery, DeliveryStatus } from '../types';

import { orderService } from '../services/orders';

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  
  const refresh = () => setDeliveries(deliveryService.getDeliveries().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

  useEffect(() => {
    refresh();
  }, []);

  const handleStatusChange = (id: string, newStatus: DeliveryStatus) => {
    deliveryService.updateDeliveryStatus(id, newStatus, 'admin', 'Status updated manually');
    
    // Sync to Order
    const del = deliveryService.getDeliveries().find(d => d.id === id);
    if (del) {
      if (newStatus === 'OUT_FOR_DELIVERY') orderService.updateOrderStatus(del.orderId, 'OUT_FOR_DELIVERY', undefined, 'admin');
      if (newStatus === 'DELIVERED') orderService.updateOrderStatus(del.orderId, 'DELIVERED', undefined, 'admin');
      if (newStatus === 'CANCELLED') orderService.updateOrderStatus(del.orderId, 'CANCELLED', undefined, 'admin');
      if (newStatus === 'FAILED') orderService.updateOrderStatus(del.orderId, 'FAILED', undefined, 'admin');
    }

    refresh();
  };

  const handleAssign = (id: string) => {
    const driver = prompt('Enter driver name:');
    if (driver) {
      deliveryService.assignDelivery(id, driver, 'admin');
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Deliveries</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b text-gray-900 font-bold">
            <tr>
              <th className="p-4">Delivery ID</th>
              <th className="p-4">Order ID</th>
              <th className="p-4">Address</th>
              <th className="p-4">Assigned To</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deliveries.map(del => (
              <tr key={del.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{del.id}</td>
                <td className="p-4">{del.orderId}</td>
                <td className="p-4">{del.address?.building}, {del.address?.roomNumber}</td>
                <td className="p-4 font-medium">{del.assignedTo || <span className="text-gray-400 italic">Unassigned</span>}</td>
                <td className="p-4">
                  <select 
                    className="p-1 border rounded text-xs"
                    value={del.status}
                    onChange={e => handleStatusChange(del.id, e.target.value as DeliveryStatus)}
                  >
                    <option value="NOT_ASSIGNED">Not Assigned</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                    <option value="RESCHEDULED">Rescheduled</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
                <td className="p-4">
                  {!del.assignedTo && (
                    <button 
                      onClick={() => handleAssign(del.id)}
                      className="text-primary hover:underline font-medium text-sm mr-4"
                    >
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {deliveries.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No deliveries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
