import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orders';
import { cartService } from '../services/cart';
import { Product } from '../types';
import productsData from '../data/products.json';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = orderService.getOrder(id || '');

  if (!order) return <div className="p-12 text-center">Order not found</div>;

  const handleOrderAgain = () => {
    // Add all items back to cart
    order.items.forEach(item => {
      const product = (productsData as Product[]).find(p => p.id === item.productId);
      const variant = product?.variants.find(v => v.id === item.variantId);
      if (product && variant) {
        cartService.addItem(product, variant, item.quantity);
      }
    });
    window.dispatchEvent(new Event('cart_updated'));
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <button onClick={() => navigate('/orders')} className="text-gray-500 hover:text-primary">← Back to Orders</button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-8 border-b pb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order {order.id}</h1>
            <p className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={handleOrderAgain} className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">
            Order Again
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Items</h3>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <p className="font-bold">{item.productName}</p>
                    <p className="text-sm text-gray-500">{item.variantName} x {item.quantity}</p>
                  </div>
                  <p className="font-bold">₹{item.subtotal}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 space-y-2 border-t pt-4">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>₹{order.deliveryFee}</span></div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"><span>Total</span><span>₹{order.total}</span></div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Delivery Details</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
              <p className="font-bold text-base mb-1">{order.address?.locationType}</p>
              <p>{order.address?.building}</p>
              <p>{order.address?.roomNumber}</p>
              {order.address?.landmark && <p>Landmark: {order.address.landmark}</p>}
            </div>

            <h3 className="font-bold text-lg mt-8 mb-4 text-gray-900 border-b pb-2">Order Type</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
              <p className="font-bold text-base mb-1">{order.orderType.replace(/_/g, ' ')}</p>
              {order.orderType === 'CUSTOM' && <p>Every {order.schedule.customDays} days</p>}
            </div>

            <h3 className="font-bold text-lg mt-8 mb-4 text-gray-900 border-b pb-2">Payment</h3>
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700">
              <p>Method: {order.paymentMethod}</p>
              <p>Status: <span className={`font-bold ${order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>{order.paymentStatus}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
