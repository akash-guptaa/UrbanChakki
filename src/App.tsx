import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Wallet from './pages/Wallet';
import OrderDetails from './pages/OrderDetails';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminDeliveries from './pages/AdminDeliveries';
import AdminInventory from './pages/AdminInventory';
import ComingSoon from './components/ComingSoon';

// Dummy components for unbuilt pages
const AdminCustomers = () => <ComingSoon title="Customer Management" />;
const AdminRecurring = () => <ComingSoon title="Recurring Subscriptions" />;
const AdminActivity = () => <ComingSoon title="System Activity Logs" />;
import { FaWhatsapp } from 'react-icons/fa';

function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col relative bg-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <a 
        href="https://wa.me/919876543210?text=Hi%20Urban%20Chakki!%20I%20need%20help%20with%20my%20order." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 transition-transform z-50 flex items-center justify-center"
        title="Chat with Customer Care"
      >
        <FaWhatsapp size={32} />
      </a>
    </div>
  );
}

import { storage } from './services/storage';
import { useState, useEffect } from 'react';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    storage.init().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="text-xl font-bold text-primary">Loading Urban Chakki...</div></div>;
  }

  return (
    <Router>
      <Routes>
        {/* Customer Facing */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/wallet" element={<Wallet />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="deliveries" element={<AdminDeliveries />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="recurring-orders" element={<AdminRecurring />} />
          <Route path="activity" element={<AdminActivity />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
