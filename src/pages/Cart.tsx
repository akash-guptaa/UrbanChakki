import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { cartService } from '../services/cart';
import { CartItem } from '../types';

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const navigate = useNavigate();

  const loadCart = () => {
    setItems(cartService.getCart());
    setSubtotal(cartService.getSubtotal());
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    cartService.updateQuantity(id, newQuantity);
    loadCart();
    window.dispatchEvent(new Event('cart_updated'));
  };

  const removeItem = (id: string) => {
    cartService.removeItem(id);
    loadCart();
    window.dispatchEvent(new Event('cart_updated'));
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link to="/products" className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
          Shop Urban Chakki
        </Link>
      </div>
    );
  }

  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 flex flex-col gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow flex flex-col text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-900">{item.product.name}</h3>
                <p className="text-gray-500">{item.variant.name}</p>
                <div className="font-bold text-gray-900 mt-2">₹{item.variant.price * item.quantity}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-md">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiMinus />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-gray-600 hover:text-primary transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cart Summary</h2>
            <div className="flex justify-between mb-2 text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
