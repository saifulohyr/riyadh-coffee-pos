# Riyadh Coffee POS System ☕

![Riyadh Coffee POS](docs/screenshots/pos-dashboard.png)

> **A Modern, High-Performance Point of Sale System for Premium Cafes.**

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8-orange?style=flat-square&logo=mysql)](https://www.mysql.com/)

---

## 🌟 Overview

**Riyadh Coffee POS** is an enterprise-grade web application designed to streamline cafe operations. Built with a focus on **speed**, **usability**, and **scalability**, it provides a seamless experience for cashiers, kitchen staff, and administrators.

Unlike traditional POS systems, this application features a **Glassmorphism-inspired UI**, rapid transaction processing, and a robust offline-capable architecture (via local file serving).

---

## ✨ Key Features

### 🛒 Point of Sale (POS)
- **Fast & Intuitive Interface**: Designed for touchscreens with large, categorized menu grids.
- **Smart Cart Management**: Add items, customize orders (notes), and adjust quantities instantaneously.
- **Quick Payment Flow**: One-tap cash presets (50k, 100k) and automatic tax calculation (11% PPN).
- **Category Icons**: Clean, icon-based product display for fast visual scanning.

### 🍳 Kitchen Display System (KDS)
- **Real-time Order Tracking**: Orders appear instantly in the kitchen view.
- **Status Management**: Track order lifecycle from `Pending` → `Preparing` → `Ready` → `Completed`.
- **Sound Notifications**: Audio alert when new orders arrive (toggleable).

### 📊 Admin Dashboard
- **Product Management**: Comprehensive CRUD operations with category-based organization.
- **Sales Analytics**: Detailed daily transaction reports with **Excel Export** capability.
- **User Management**: Secure staff access control with role-based permissions (Admin/Cashier/Kitchen).

---

## � Screenshots

### Product Management
Manage your inventory with ease. Set stock levels and categorize items with intuitive icons.
![Product Management](docs/screenshots/product-management.png)

### Payment Processing
Secure and accurate transaction handling with automatic change calculation.
![Payment Flow](docs/screenshots/payment-flow.png)

---

## 🏗️ Architecture

The system follows a modern **Client-Server** architecture:

| component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React + Zustand | Lightning-fast SPA with global state management for cart/orders. |
| **Backend** | Express + Drizzle | Type-safe API layer connecting to MySQL. Optimized for speed. |
| **Database** | MySQL (Aiven) | Cloud-hosted database for production deployment. |
| **Auth** | Better Auth | Secure, session-based authentication. |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/saifulohyr/riyadh-coffee-pos.git
cd riyadh-coffee-pos

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Configuration
Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=mysql://root:password@localhost:3306/riyadh_coffee_db
BETTER_AUTH_SECRET=generate_a_secure_random_string
BETTER_AUTH_URL=http://localhost:5000
TAX_RATE=0.11
```

### 3. Database Setup
Initialize the database schema and seed initial data:
```bash
cd backend
npm run db:push   # Create tables
npm run db:seed   # Insert sample data (Products & Users)
```

### 4. Running the App
Open two terminals to run the full stack:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Access the application at **http://localhost:5173**.

---

## 🧪 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@riyadh.coffee` | `admin123` |
| **Cashier** | `cashier@riyadh.coffee` | `cashier123` |
| **Kitchen** | `kitchen@riyadh.coffee` | `kitchen123` |

---

## 📄 License
This project is proprietary software developed for Riyadh Coffee.
