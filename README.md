# 📦 Multi-Store Inventory Management System

A robust, full-stack multi-location retail operations platform designed to track cross-store stock movements, manage role-based access control (RBAC), and visualize real-time net profit analytics.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=flat&logo=vercel)](https://inventory-management-system-eta-tan.vercel.app/)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-282C34?style=flat&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=flat&logo=tailwind-css&logoColor=white)

---

## ✨ Core Features

- **Multi-Store Architecture:** Seamlessly manage inventory across multiple physical locations or warehouses from a single centralized dashboard.
- **Real-Time Stock Logging:** Automated stock movement tracking (`StockLog`) supporting sales, restocks, and manual inventory adjustments.
- **Advanced Financial Analytics:** Calculates true net profit margins (`(sellingPrice - costPrice) * quantity`) alongside a hybrid historical and real-time monthly revenue chart.
- **Low Stock Operational Alerts:** Automated threshold monitoring (`minStockThreshold`) that instantly flags products requiring reordering across locations.
- **Role-Based Access Control (RBAC):** Granular permissions for Admins, Managers, and Staff powered by **Better-Auth**.
- **Type-Safe Validation:** Robust runtime schema validation using **Zod** across all Server Actions and API inputs.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Server Actions, React Server Components)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL, Prisma ORM (hosted via Supabase)
- **Authentication:** Better-Auth (`authClient`, server-side session propagation)
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

---

## 💡 Engineering Highlights

- **Optimized Data Fetching:** Utilizes parallelized database queries via `Promise.all` in Server Components to minimize layout and dashboard load latency.
- **Precise Business Logic:** Implements absolute quantity tracking (`Math.abs()`) for inventory adjustments and accurate net profit calculations.
- **Hybrid Chart Data Rendering:** Blends historical retail trends with live, dynamic current-month database computations for immediate analytical insight.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have **Node.js** (v18+ recommended) and a **PostgreSQL** database instance running.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/James6952551/inventory-management-system.git
   cd inventory-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your environment variables:**
   Create a `.env` file in the root directory and configure your credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
   BETTER_AUTH_SECRET="your_secret_key"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Run Prisma migrations & generate client:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 Project Structure

```text
├── app/                  # Next.js App Router pages, layouts, and Server Actions
├── components/           # Reusable UI components and dashboard views
├── constants/            # Static configuration, dashboard headers, and trend data
├── lib/                  # Prisma client instance, Better-Auth config, and utilities
├── prisma/               # Database schema and migration files
└── public/               # Static assets
```
