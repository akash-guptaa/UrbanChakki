# Urban Chakki E-commerce Application

## Project Overview
A modern, responsive e-commerce web application for selling Urban Chakki. Features include a shopping cart, recurring orders (subscriptions), map-based location selection, a demo wallet system, and detailed user analytics tracking.

## Architecture
This project is built using:
- **React 18** with **Vite**
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Router** for navigation
- **localStorage** for persistence (no backend database yet)

## How to Install
1. Clone the repository
2. Run `npm install` to install dependencies
3. Ensure you have Node.js v18+ installed

## How to Run Locally
Run the development server using:
```bash
npm run dev
```

## Project Structure
```text
src/
  components/  # Reusable UI components (Header, ProductCard, etc.)
  pages/       # Route-level components (Home, Products, Cart, Checkout, etc.)
  data/        # JSON data files (products.json, categories.json)
  services/    # Business logic (cart, orders, wallet, analytics, storage)
  utils/       # Helper functions
  types/       # TypeScript interfaces
```

## JSON Data Structure
Products are stored in `src/data/products.json` and loaded dynamically.
This allows new variants and products to be added without code changes.

## localStorage Strategy
A centralized `services/storage.ts` abstraction manages all interactions with `localStorage`. Components never access localStorage directly. This makes it trivial to swap out localStorage for a real API later.

## Subsystems
- **Cart Architecture**: Managed by `services/cart.ts`. Calculates subtotals and totals, updates quantities, and persists items.
- **Order Architecture**: Managed by `services/orders.ts`. Creates unique `ORD-` IDs, stores items, delivery info, and schedules.
- **Recurring Order Architecture**: Subscriptions are created alongside orders if the user selects a recurring schedule (Weekly, 15 Days, Monthly, Custom). Stored in the `subscriptions` collection.
- **Wallet Architecture**: `services/wallet.ts` enforces a true ledger system. Balances are derived from `CREDIT` and `DEBIT` transactions. It prevents negative balances and blocks checkout if funds are insufficient.
- **Analytics Event Architecture**: `services/analytics.ts` tracks all critical actions (cart adds, page views, wallet top-ups) with timestamps and metadata for future funnel analysis.
- **Map/Location**: The prototype simulates location using HTML5 Geolocation (`navigator.geolocation`) to fetch latitude/longitude.

## Future Database Schema
To migrate from JSON/localStorage to a real database (e.g. PostgreSQL), use these tables:

- `users` (id, name, phone, email)
- `categories` (id, name, slug)
- `products` (id, category_id, name, image)
- `product_variants` (id, product_id, name, weight, price, sku)
- `addresses` (id, user_id, full_address, building, room_number, latitude, longitude)
- `orders` (id, user_id, status, order_type, subtotal, delivery_fee, total)
- `order_items` (id, order_id, product_id, variant_id, quantity, unit_price)
- `subscriptions` (id, user_id, order_id, frequency, start_date, next_delivery_date)
- `wallets` (id, user_id, current_balance)
- `wallet_transactions` (id, wallet_id, type, direction, amount, status)
- `analytics_events` (id, user_id, session_id, event_name, metadata, created_at)

## API Endpoints (Future Backend)
```text
GET    /api/products
GET    /api/products/:id
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
POST   /api/subscriptions
GET    /api/subscriptions
GET    /api/addresses
POST   /api/addresses
POST   /api/wallet/topup
POST   /api/wallet/debit
POST   /api/analytics/events
```

## Migration Strategy
1. Replace `services/storage.ts` calls with `fetch` or `axios` calls to the API.
2. Implement user authentication (JWT or Session) to replace `demo_user`.
3. Add a real payment gateway (Razorpay/Stripe) instead of the demo Wallet.
4. Replace HTML5 Geolocation with a Google Maps picker UI.

## Environment Variables
Future `.env` file should include:
- `VITE_API_URL`
- `VITE_MAPS_API_KEY`
- `VITE_PAYMENT_GATEWAY_KEY`

## Future Authentication
Implement OTP-based login via SMS/WhatsApp since this is a grocery e-commerce platform.

## Future Payment Integration
Integrate Razorpay or PayTM for Indian market context, supporting UPI, Cards, and Netbanking.
