import { useState } from 'react';
import { walletService } from '../services/wallet';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Wallet() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);
  const currentUserId = user?.id || '';
  const [balance, setBalance] = useState(walletService.getBalance(currentUserId));
  const [transactions, setTransactions] = useState(walletService.getTransactions(currentUserId));
  const [customAmount, setCustomAmount] = useState('');

  const handleAddMoney = (amount: number) => {
    walletService.addMoney(currentUserId, amount);
    setBalance(walletService.getBalance(currentUserId));
    setTransactions(walletService.getTransactions(currentUserId));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wallet</h1>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 text-center">
        <p className="text-gray-500 mb-2">Available Balance</p>
        <p className="text-5xl font-bold text-primary mb-8">₹{balance}</p>
        
        <div className="max-w-md mx-auto">
          <h3 className="font-bold mb-4">Add Money (Demo)</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[100, 250, 500, 1000, 2000].map(amt => (
              <button key={amt} onClick={() => handleAddMoney(amt)} className="py-2 border border-gray-300 rounded-md hover:border-primary hover:text-primary transition-colors">
                ₹{amt}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" placeholder="Custom amount" className="flex-grow p-3 border rounded-md" value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
            <button onClick={() => {
              if (Number(customAmount) > 0) {
                handleAddMoney(Number(customAmount));
                setCustomAmount('');
              }
            }} className="px-6 bg-primary text-white rounded-md font-bold hover:bg-primary/90">Add</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <h2 className="text-xl font-bold p-6 border-b bg-gray-50">Transactions</h2>
        <div className="divide-y">
          {transactions.map(txn => (
            <div key={txn.id} className="p-6 flex justify-between items-center">
              <div>
                <p className="font-bold">{txn.description}</p>
                <p className="text-sm text-gray-500">{new Date(txn.createdAt).toLocaleString()}</p>
                {txn.orderId && <p className="text-xs text-gray-400 mt-1">Order: {txn.orderId}</p>}
              </div>
              <div className={`text-xl font-bold ${txn.direction === 'CREDIT' ? 'text-green-600' : 'text-gray-900'}`}>
                {txn.direction === 'CREDIT' ? '+' : '-'}₹{txn.amount}
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p className="p-6 text-center text-gray-500">No transactions yet.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Benefits of Wallet</h3>
          <ul className="space-y-3 text-sm text-gray-700 list-disc pl-5">
            <li><strong>Seamless Subscriptions:</strong> Automatic deductions for your recurring Urban Chakki orders.</li>
            <li><strong>Instant Refunds:</strong> Cancelled orders are refunded instantly back to your wallet.</li>
            <li><strong>Faster Checkout:</strong> 1-click checkout without entering OTPs or card details.</li>
            <li><strong>Exclusive Offers:</strong> Get extra cashback and discounts on special wallet top-up days.</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Terms & Conditions</h3>
          <ul className="space-y-3 text-sm text-gray-600 list-disc pl-5">
            <li>Wallet balance cannot be transferred to another user or withdrawn to a bank account.</li>
            <li>If a recurring order fails due to insufficient balance, the order will be marked as "Payment Required" and will be processed once funds are added.</li>
            <li>Maximum wallet balance limit is ₹10,000 at any given time.</li>
            <li>Promotional cashback added to the wallet may expire after 90 days.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
