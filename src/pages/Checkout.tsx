import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/cart';
import { orderService } from '../services/orders';
import { walletService } from '../services/wallet';

import { authService } from '../services/auth';
import type { Address, OrderSchedule } from '../types';

export default function Checkout() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Details, 2 = Payment & Review
  const [address, setAddress] = useState<Address>({
    id: '', userId: '', label: 'Home', fullAddress: '', building: '', roomNumber: '', landmark: '', locationType: 'Home', latitude: null, longitude: null
  });
  const [schedule, setSchedule] = useState<OrderSchedule>({ type: 'ONE_TIME' });
  const [paymentMode, setPaymentMode] = useState<'WALLET' | 'CASH'>('WALLET');
  const [error, setError] = useState('');

  const cartItems = cartService.getCart();
  const subtotal = cartService.getSubtotal();
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id || '';
  const walletBalance = walletService.getBalance(currentUserId);

  useEffect(() => {
    if (!currentUser) navigate('/login', { state: { from: { pathname: '/checkout' } } });
    else if (cartItems.length === 0) navigate('/cart');
    
    // Auto-fill address from last order
    if (currentUserId) {
      const pastOrders = orderService.getOrders(currentUserId);
      if (pastOrders.length > 0 && pastOrders[0].address) {
        setAddress(pastOrders[0].address);
      }
    }
  }, [currentUser, currentUserId, cartItems.length, navigate]);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setAddress(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      });
    }
  };

  const placeOrder = () => {
    if (paymentMode === 'WALLET' && walletBalance < total) {
      setError('Insufficient wallet balance');
      return;
    }

    try {
      const order = orderService.createOrder(
        currentUserId, cartItems, address, schedule, subtotal, deliveryFee, total, paymentMode
      );
      
      if (paymentMode === 'WALLET') {
        walletService.debit(currentUserId, total, { orderId: order.id, description: `Payment for order ${order.id}` });
        orderService.updateOrderStatus(order.id, 'CONFIRMED', 'PAID');
      } else {
        // Cash on delivery
        orderService.updateOrderStatus(order.id, 'CONFIRMED', 'PENDING');
      }
      
      cartService.clearCart();
      window.dispatchEvent(new Event('cart_updated'));
      navigate(`/orders/${order.id}`);
    } catch (e: any) {
      setError(e.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-8 relative">
        <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-gray-200 -z-10 -translate-y-1/2"></div>
        {[1, 2].map(i => (
          <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= i ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'} ${i === 1 ? 'mr-auto' : 'ml-auto'}`}>
            {i}
          </div>
        ))}
      </div>
      <div className="flex justify-between mb-8 text-sm font-bold text-gray-500 px-2">
        <span className={step >= 1 ? 'text-primary' : ''}>Delivery & Schedule</span>
        <span className={step >= 2 ? 'text-primary' : ''}>Payment & Review</span>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
        
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Delivery Location</h2>
              <div className="space-y-4">
                <button onClick={handleLocationClick} className="w-full py-2 bg-gray-100 rounded-md hover:bg-gray-200">📍 Use Current Location</button>
                {address.latitude && <p className="text-green-600 text-sm font-bold">✓ Location captured</p>}
                
                <div className="flex flex-col gap-4">
                  <input placeholder="Building / Society" className="w-full p-3 border rounded-md" value={address.building} onChange={e => setAddress({...address, building: e.target.value})} />
                  <input placeholder="Flat / Room / House Number" className="w-full p-3 border rounded-md" value={address.roomNumber} onChange={e => setAddress({...address, roomNumber: e.target.value})} />
                </div>
                
                <div className="flex flex-col gap-4">
                  <input placeholder="Landmark" className="w-full p-3 border rounded-md" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} />
                  <select className="w-full p-3 border rounded-md" value={address.locationType} onChange={e => setAddress({...address, locationType: e.target.value})}>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Shop">Shop</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-4">Order Schedule</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['ONE_TIME', 'WEEKLY', 'EVERY_15_DAYS', 'MONTHLY', 'CUSTOM'].map(type => (
                  <label key={type} className={`flex items-center justify-center py-4 px-2 border rounded-md cursor-pointer transition-all uppercase tracking-wide text-sm font-bold ${schedule.type === type ? 'border-[#C19A6B] bg-[#fbf7f3] text-[#C19A6B]' : 'border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                    <input type="radio" name="schedule" checked={schedule.type === type} onChange={() => setSchedule({ ...schedule, type: type as any })} className="hidden" />
                    {type.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
              {schedule.type === 'CUSTOM' && (
                <div className="mt-4">
                  <label className="text-sm font-bold text-gray-700">Repeat every (days)</label>
                  <input type="number" className="w-full p-3 border rounded-md mt-1" value={schedule.customDays || ''} onChange={e => setSchedule({...schedule, customDays: parseInt(e.target.value)})} min="1" />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button onClick={() => {
                if (!address.building || !address.roomNumber) setError('Building and Room number required');
                else if (schedule.type === 'CUSTOM' && !schedule.customDays) setError('Enter custom days for schedule');
                else { setError(''); setStep(2); }
              }} className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors">Next: Payment & Review</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                <div className="border-b pb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.product.name} ({item.variant.name}) <span className="text-gray-400">x {item.quantity}</span></span>
                      <span className="font-bold">₹{item.variant.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Deliver to:</strong> {address.building}, {address.roomNumber} ({address.locationType})</p>
                  <p className="mt-1"><strong>Schedule:</strong> {schedule.type.replace(/_/g, ' ')} {schedule.type === 'CUSTOM' ? `(${schedule.customDays} days)` : ''}</p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-gray-600 mb-1"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between text-gray-600 mb-2"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
                  <div className="flex justify-between font-bold text-xl text-gray-900"><span>Total</span><span>₹{total}</span></div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMode === 'WALLET' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <input type="radio" checked={paymentMode === 'WALLET'} onChange={() => setPaymentMode('WALLET')} className="w-5 h-5 text-primary mr-4" />
                  <div className="flex-grow">
                    <p className="font-bold text-gray-900">Pay from Wallet</p>
                    <p className="text-sm text-gray-500">Current Balance: ₹{walletBalance}</p>
                  </div>
                </label>

                {paymentMode === 'WALLET' && walletBalance < total && (
                  <div className="ml-9 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    Insufficient balance. You need <strong>₹{total - walletBalance}</strong> more to complete this order.
                    <br />
                    <button onClick={() => navigate('/account/wallet')} className="mt-2 underline font-bold">Add Money to Wallet</button>
                  </div>
                )}

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMode === 'CASH' ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}>
                  <input type="radio" checked={paymentMode === 'CASH'} onChange={() => setPaymentMode('CASH')} className="w-5 h-5 text-primary mr-4" />
                  <div className="flex-grow">
                    <p className="font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-sm text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="w-1/3 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold transition-colors">Back</button>
              <button onClick={placeOrder} className="w-2/3 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors">Place Order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
