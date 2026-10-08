import express from 'express';
import cors from 'cors';

import { userRepository } from './repositories/userRepository';
import { productRepository } from './repositories/productRepository';
import { orderRepository } from './repositories/orderRepository';
import { inventoryRepository } from './repositories/inventoryRepository';
import { deliveryRepository } from './repositories/deliveryRepository';
import { walletRepository } from './repositories/walletRepository';
import { adminRepository } from './repositories/adminRepository';
import { analyticsRepository } from './repositories/analyticsRepository';

const app = express();
app.use(cors());
app.use(express.json());

// A map to connect frontend storage keys to backend JSON repositories
const repoMap: Record<string, any> = {
  'orders': orderRepository,
  'inventory': inventoryRepository,
  'deliveries': deliveryRepository,
  'users': userRepository,
  'products': productRepository,
  'wallet': walletRepository,
  'admin_events': adminRepository,
  'analytics_events': analyticsRepository
};

// Generic fallback state for simple UI config keys (like current_user_id)
let genericState: Record<string, any> = {};

app.get('/api/state', async (req, res) => {
  const state: Record<string, any> = { ...genericState };
  // Read from all specialized JSON repositories
  for (const [key, repo] of Object.entries(repoMap)) {
    state[key] = await repo.readAll();
  }
  res.json(state);
});

app.post('/api/state/:key', async (req, res) => {
  const key = req.params.key;
  if (repoMap[key]) {
    // Write entire collection to the specialized JSON file
    await repoMap[key].writeAll(req.body);
  } else {
    // Fallback for generic keys
    genericState[key] = req.body;
  }
  res.json({ success: true });
});

app.delete('/api/state/:key', async (req, res) => {
  const key = req.params.key;
  if (repoMap[key]) {
    await repoMap[key].writeAll([]);
  } else {
    delete genericState[key];
  }
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`JSON API Server running on port ${PORT}`);
});
