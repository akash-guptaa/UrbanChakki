import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiTruck, FiUsers, FiActivity, FiLogOut, FiRepeat } from 'react-icons/fi';
import { authService } from '../services/auth';
import { useEffect } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user || user.phone !== '7400422743') {
      navigate('/login');
    }
  }, [user, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
    { name: 'Orders', path: '/admin/orders', icon: FiBox },
    { name: 'Recurring', path: '/admin/recurring-orders', icon: FiRepeat },
    { name: 'Deliveries', path: '/admin/deliveries', icon: FiTruck },
    { name: 'Inventory', path: '/admin/inventory', icon: FiBox },
    { name: 'Customers', path: '/admin/customers', icon: FiUsers },
    { name: 'Activity', path: '/admin/activity', icon: FiActivity },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/admin/dashboard" className="text-xl font-bold text-primary">Urban Chakki Admin</Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'text-primary'
                    : 'text-gray-400'
                }`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => { authService.logout(); navigate('/'); }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
          >
            <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout Exit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
          <span className="text-lg font-bold text-primary">Admin</span>
          <button onClick={() => navigate('/admin/dashboard')} className="text-gray-500">Menu</button>
        </header>

        {/* Desktop Header */}
        <header className="h-16 bg-white border-b border-gray-200 hidden md:flex items-center justify-between px-8">
          <div className="font-medium text-gray-800">
            {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">Hi, Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
