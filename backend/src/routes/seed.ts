import { Router } from 'express';
import { db } from '../db/index.js';
import { products } from '../db/schema.js';

const router = Router();

router.all('/seed', async (_req, res) => {
  try {
    // Delete existing products
    await db.delete(products);

    // Sample products from seed-products.ts
    const sampleProducts = [
      { name: "Kopi Susu Riyadh", category: "Coffee", price: "20000", stock: 100, description: "Es kopi susu gula aren signature dengan tekstur ekstra creamy dan manis yang pas." },
      { name: "Sea Salt Oat Latte", category: "Coffee", price: "35000", stock: 50, description: "Perpaduan sehat susu gandum (oat milk) dengan espresso dan sentuhan gurih sea salt." },
      { name: "Black Pink", category: "Coffee", price: "28000", stock: 40, description: "Coffee mocktail segar perpaduan espresso, sirup stroberi, dan soda." },
      { name: "Dirty Chai Latte", category: "Coffee", price: "32000", stock: 30, description: "Espresso latte dengan campuran rempah chai yang hangat dan aromatik." },
      { name: "Americano On The Rocks", category: "Coffee", price: "18000", stock: 100, description: "Double shot espresso dari biji kopi pilihan yang disajikan dingin dan kuat." },
      { name: "Caramel Macchiato", category: "Coffee", price: "30000", stock: 45, description: "Layer susu vanila lembut dengan espresso dan topping drizzle karamel manis." },
      { name: "Manual Brew V60", category: "Coffee", price: "25000", stock: 60, description: "Kopi seduh manual dengan metode V60 untuk menonjolkan karakter rasa biji kopi seasonal." },
      { name: "Espresso Tonic", category: "Coffee", price: "26000", stock: 35, description: "Minuman kopi segar yang mencampurkan espresso, air tonik, dan irisan lemon." },
      { name: "Butterscotch Coffee", category: "Coffee", price: "28000", stock: 40, description: "Es kopi susu dengan cita rasa mentega dan karamel yang gurih dan unik." },
      { name: "Magic", category: "Coffee", price: "28000", stock: 25, description: "Double ristretto dengan susu hangat, memberikan rasa kopi yang lebih intens dari latte." },
      { name: "Artisan Matcha Latte", category: "Tea", price: "32000", stock: 40, description: "Bubuk matcha Jepang murni kualitas premium yang dicampur dengan susu creamy." },
      { name: "Earl Grey Milk Tea", category: "Tea", price: "25000", stock: 50, description: "Teh hitam Earl Grey beraroma jeruk bergamot yang dipadukan dengan susu lembut." },
      { name: "Cromboloni Pistachio", category: "Pastry", price: "35000", stock: 20, description: "Pastry bulat renyah yang sedang tren dengan isian krim kacang pistachio melimpah." },
      { name: "Classic Butter Croissant", category: "Pastry", price: "22000", stock: 30, description: "Croissant klasik Prancis yang renyah di luar, lembut di dalam, dan sangat buttery." },
      { name: "Nasi Goreng Spesial", category: "Food", price: "25000", stock: 50, description: "Nasi goreng khas dengan telur, ayam, dan sayuran segar." }
    ];

    // Insert products
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }

    res.json({
      success: true,
      message: `✅ Seeded ${sampleProducts.length} products successfully!`
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed products'
    });
  }
});

export default router;
