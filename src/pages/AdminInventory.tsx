import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventory';
import { InventoryItem } from '../types';

export default function AdminInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  const refresh = () => setInventory(inventoryService.getInventory());

  useEffect(() => {
    refresh();
  }, []);

  const handleAddStock = (variantId: string) => {
    const qty = prompt('Enter quantity to add:');
    if (qty && !isNaN(Number(qty))) {
      inventoryService.addStock(variantId, Number(qty), 'Manual stock addition', 'admin');
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b text-gray-900 font-bold">
            <tr>
              <th className="p-4">Variant ID</th>
              <th className="p-4">Total Stock</th>
              <th className="p-4">Reserved</th>
              <th className="p-4">Available</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-900">{item.variantId}</td>
                <td className="p-4">{item.stock}</td>
                <td className="p-4 text-orange-500">{item.reserved}</td>
                <td className="p-4 font-bold text-green-600">{item.stock - item.reserved}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                    item.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => handleAddStock(item.variantId)}
                    className="text-primary hover:underline font-medium text-sm"
                  >
                    + Add Stock
                  </button>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No inventory tracked yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
