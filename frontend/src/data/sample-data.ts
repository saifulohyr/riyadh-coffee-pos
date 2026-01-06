import type { Product, Category } from '@/types'

// Demo Categories
export const sampleCategories: Category[] = [
  { id: 'cat-1', name: 'Kopi', icon: '', order: 1 },
  { id: 'cat-2', name: 'Makanan', icon: '', order: 2 },
  { id: 'cat-3', name: 'Minuman', icon: '', order: 3 },
  { id: 'cat-4', name: 'Dessert', icon: '', order: 4 },
]

// Demo Products
export const sampleProducts: Product[] = [
  // Kopi
  {
    id: 'prod-1',
    name: 'Americano',
    price: 25000,
    categoryId: 'cat-1',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Espresso dengan air panas',
  },
  {
    id: 'prod-2',
    name: 'Latte',
    price: 30000,
    categoryId: 'cat-1',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Espresso dengan susu steamed',
  },
  {
    id: 'prod-3',
    name: 'Cappuccino',
    price: 32000,
    categoryId: 'cat-1',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Espresso dengan foam susu tebal',
  },
  {
    id: 'prod-4',
    name: 'Espresso',
    price: 22000,
    categoryId: 'cat-1',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Shot espresso murni',
  },
  {
    id: 'prod-5',
    name: 'Mocha',
    price: 35000,
    categoryId: 'cat-1',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Espresso dengan cokelat dan susu',
  },
  {
    id: 'prod-6',
    name: 'Caramel Macchiato',
    price: 38000,
    categoryId: 'cat-1',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Latte dengan sirup caramel',
  },

  // Makanan
  {
    id: 'prod-7',
    name: 'Croissant',
    price: 25000,
    categoryId: 'cat-2',
    stock: 15,
    isAvailable: true,
    description: 'Croissant butter klasik',
  },
  {
    id: 'prod-8',
    name: 'Sandwich',
    price: 35000,
    categoryId: 'cat-2',
    stock: 10,
    isAvailable: true,
    description: 'Sandwich telur dan keju',
  },
  {
    id: 'prod-9',
    name: 'Toast Avocado',
    price: 42000,
    categoryId: 'cat-2',
    stock: 8,
    isAvailable: true,
    description: 'Roti panggang dengan avocado',
  },
  {
    id: 'prod-10',
    name: 'Pasta Carbonara',
    price: 55000,
    categoryId: 'cat-2',
    stock: 12,
    isAvailable: true,
    description: 'Spaghetti dengan saus carbonara',
  },

  // Minuman
  {
    id: 'prod-11',
    name: 'Matcha Latte',
    price: 28000,
    categoryId: 'cat-3',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Matcha Jepang dengan susu',
  },
  {
    id: 'prod-12',
    name: 'Cokelat Panas',
    price: 25000,
    categoryId: 'cat-3',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Cokelat Belgian premium',
  },
  {
    id: 'prod-13',
    name: 'Lemon Tea',
    price: 20000,
    categoryId: 'cat-3',
    stock: 'unlimited',
    isAvailable: true,
    description: 'Teh lemon segar',
  },
  {
    id: 'prod-14',
    name: 'Orange Juice',
    price: 22000,
    categoryId: 'cat-3',
    stock: 20,
    isAvailable: true,
    description: 'Jus jeruk segar',
  },

  // Dessert
  {
    id: 'prod-15',
    name: 'Cheesecake',
    price: 45000,
    categoryId: 'cat-4',
    stock: 6,
    isAvailable: true,
    description: 'New York cheesecake',
  },
  {
    id: 'prod-16',
    name: 'Tiramisu',
    price: 48000,
    categoryId: 'cat-4',
    stock: 5,
    isAvailable: true,
    description: 'Tiramisu klasik Italia',
  },
  {
    id: 'prod-17',
    name: 'Brownies',
    price: 32000,
    categoryId: 'cat-4',
    stock: 10,
    isAvailable: true,
    description: 'Brownies cokelat premium',
  },
  {
    id: 'prod-18',
    name: 'Ice Cream',
    price: 25000,
    categoryId: 'cat-4',
    stock: 'unlimited',
    isAvailable: true,
    description: '2 scoop pilihan rasa',
  },
]

// Demo Users
export const sampleUsers = [
  { id: 'user-1', username: 'kasir', email: 'cashier@riyadh.coffee', name: 'Kasir', role: 'cashier' as const },
  { id: 'user-3', username: 'dapur', email: 'kitchen@riyadh.coffee', name: 'Kitchen', role: 'kitchen' as const },
  { id: 'user-4', username: 'admin', email: 'admin@riyadh.coffee', name: 'Admin', role: 'admin' as const },
]

// Demo Tables
export const sampleTables = [
  // Indoor
  { id: 'table-1', number: 'T-01', capacity: 4, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-2', number: 'T-02', capacity: 2, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-3', number: 'T-03', capacity: 4, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-4', number: 'T-04', capacity: 6, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-5', number: 'T-05', capacity: 2, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-6', number: 'T-06', capacity: 4, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-7', number: 'T-07', capacity: 2, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-8', number: 'T-08', capacity: 4, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-9', number: 'T-09', capacity: 2, status: 'available' as const, area: 'indoor' as const },
  { id: 'table-10', number: 'T-10', capacity: 6, status: 'available' as const, area: 'indoor' as const },
  // Outdoor
  { id: 'table-11', number: 'T-11', capacity: 4, status: 'available' as const, area: 'outdoor' as const },
  { id: 'table-12', number: 'T-12', capacity: 4, status: 'available' as const, area: 'outdoor' as const },
  { id: 'table-13', number: 'T-13', capacity: 6, status: 'available' as const, area: 'outdoor' as const },
  { id: 'table-14', number: 'T-14', capacity: 4, status: 'available' as const, area: 'outdoor' as const },
]
