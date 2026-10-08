const fs = require('fs');

// Replace in Checkout.tsx
let checkout = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');
checkout = checkout.replace("import { storage } from '../services/storage';", "import { storage } from '../services/storage';\nimport { authService } from '../services/auth';");
checkout = checkout.replace("const currentUserId = storage.get<string>('current_user_id') || 'demo_user';", "const currentUser = authService.getCurrentUser();\n  const currentUserId = currentUser?.id || '';");
checkout = checkout.replace("if (cartItems.length === 0) navigate('/cart');", "if (!currentUser) navigate('/login', { state: { from: { pathname: '/checkout' } } });\n    else if (cartItems.length === 0) navigate('/cart');");
fs.writeFileSync('src/pages/Checkout.tsx', checkout);

// Replace in Account.tsx
let account = fs.readFileSync('src/pages/Account.tsx', 'utf8');
account = account.replace("import { storage } from '../services/storage';", "import { authService } from '../services/auth';\nimport { useNavigate } from 'react-router-dom';\nimport { useEffect } from 'react';");
account = account.replace("export default function Account() {", "export default function Account() {\n  const navigate = useNavigate();\n  const user = authService.getCurrentUser();\n  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);");
account = account.replace("const currentUserId = storage.get<string>('current_user_id') || 'demo_user';", "const currentUserId = user?.id || '';");
account = account.replace("Hello, User 👋", "Hello, {user?.name.split(' ')[0] || 'User'} 👋");
fs.writeFileSync('src/pages/Account.tsx', account);

// Replace in Wallet.tsx
let wallet = fs.readFileSync('src/pages/Wallet.tsx', 'utf8');
wallet = wallet.replace("import { storage } from '../services/storage';", "import { authService } from '../services/auth';\nimport { useNavigate } from 'react-router-dom';\nimport { useEffect } from 'react';");
wallet = wallet.replace("export default function Wallet() {", "export default function Wallet() {\n  const navigate = useNavigate();\n  const user = authService.getCurrentUser();\n  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);");
wallet = wallet.replace("const currentUserId = storage.get<string>('current_user_id') || 'demo_user';", "const currentUserId = user?.id || '';");
fs.writeFileSync('src/pages/Wallet.tsx', wallet);

// Replace in Orders.tsx
let orders = fs.readFileSync('src/pages/Orders.tsx', 'utf8');
orders = orders.replace("import { storage } from '../services/storage';", "import { authService } from '../services/auth';\nimport { useNavigate } from 'react-router-dom';\nimport { useEffect } from 'react';");
orders = orders.replace("export default function Orders() {", "export default function Orders() {\n  const navigate = useNavigate();\n  const user = authService.getCurrentUser();\n  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);");
orders = orders.replace("const currentUserId = storage.get<string>('current_user_id') || 'demo_user';", "const currentUserId = user?.id || '';");
fs.writeFileSync('src/pages/Orders.tsx', orders);
