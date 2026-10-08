import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

export default function Login() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim().length >= 10) {
      authService.login(name, phone);
      
      if (phone === '7400422743') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } else {
      alert('Please enter a valid name and phone number (min 10 digits).');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-secondary/20 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-primary mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Enter your details to continue</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
              placeholder="e.g. Akash Kumar" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
            <input 
              type="tel" 
              required
              className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
              placeholder="e.g. 9876543210" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors shadow-md"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
