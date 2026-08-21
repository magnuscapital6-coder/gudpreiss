# TechNova — Full-Stack E-Commerce Platform

TechNova is a complete, modern, production-ready, pixel-perfect e-commerce platform built for technology products, smartphones, ultrabooks, game controllers, audio equipment, and smart home robotics.

---

## 🚀 Tech Stack

* **Frontend & SSR**: Next.js (App Router), React, TypeScript
* **Styling**: Tailwind CSS, Vanilla CSS Design System, Glassmorphism
* **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth, Storage)
* **Icons**: Lucide React
* **State Management**: React Context (Cart, Wishlist, Auth)
* **Form & Validation**: Zod, React Hook Form
* **Analytics & Charts**: Recharts

---

## 🛠️ Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_mock_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_mock_key
STRIPE_WEBHOOK_SECRET=whsec_mock_secret
```

### 3. Database Migration & Setup

Apply the SQL migration file located in `supabase/schema.sql` inside your Supabase SQL Editor.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public storefront.

### 5. Admin Dashboard Access

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin).

* **Admin Email**: `admin@technova.store`
* **Password**: `password123`

---

## 🧪 Testing & Seeding

```bash
# Run business logic automated test suite
npm test

# Seed initial database
npm run db:seed

# Check TypeScript types
npm run typecheck
```

---

## 🎨 Feature Architecture

1. **Public Storefront**:
   - Announcement TopBar with USD/EN selectors
   - Main Header with logo, dropdown indicators, live search autocomplete, user dropdown, wishlist badge, cart drawer count badge
   - Hero Slider carousel ("Hot Gadgets Deals", CTA button, pagination)
   - Quick category feature cards (Best Sellers, New Arrivals, Top Rated, On Sale)
   - Tabbed Featured Products with side promotional banners (e.g. MacBook Air M2)
   - Just Arrived section with "VIEW ALL" link
   - Category Promo Cards (Game Controllers, Smartphones, Smart Home)
   - Secondary Featured Products section
   - Newsletter signup & comprehensive footer

2. **Catalog & Shop**:
   - Dynamic URL-synced filters (Category, Brand, Price slider, On Sale, Sorting)
   - Grid and List layout toggles
   - Product detail page with multi-image gallery zoom, variant selection matrix (Storage, Color), stock status, verified reviews, and related products

3. **Cart & Checkout**:
   - Persistent slide-over cart drawer & full `/cart` page
   - Coupon validator input with instant subtotal/tax/shipping recalculations
   - Multistep checkout flow (Shipping address, payment gateway selection, order placement Server Action)
   - Order confirmation page (`/checkout/success`)

4. **SaaS Admin Dashboard (`/admin`)**:
   - Real-time KPI analytics (Revenue, Orders, Conversion Rate, AOV)
   - Product CRUD with variant management & inventory threshold control
   - Order management with order status workflow state machine (`pending` -> `processing` -> `shipped` -> `delivered`)
   - Stock control center with low stock alerts
   - Coupon generator & homepage banner configuration
   - Customer review moderation panel
   - Store settings & payment gateway enablement

---

## 📄 License

MIT © TechNova Store Inc.
