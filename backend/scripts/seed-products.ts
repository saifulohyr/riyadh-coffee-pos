import 'dotenv/config';
import mysql from 'mysql2/promise';

const sampleProducts = [
  { "name": "Kopi Susu Riyadh", "category": "Coffee", "price": 20000, "stock": 100, "description": "Es kopi susu gula aren signature dengan tekstur ekstra creamy dan manis yang pas." },
  { "name": "Sea Salt Oat Latte", "category": "Coffee", "price": 35000, "stock": 50, "description": "Perpaduan sehat susu gandum (oat milk) dengan espresso dan sentuhan gurih sea salt." },
  { "name": "Black Pink", "category": "Coffee", "price": 28000, "stock": 40, "description": "Coffee mocktail segar perpaduan espresso, sirup stroberi, dan soda." },
  { "name": "Dirty Chai Latte", "category": "Coffee", "price": 32000, "stock": 30, "description": "Espresso latte dengan campuran rempah chai yang hangat dan aromatik." },
  { "name": "Americano On The Rocks", "category": "Coffee", "price": 18000, "stock": 100, "description": "Double shot espresso dari biji kopi pilihan yang disajikan dingin dan kuat." },
  { "name": "Caramel Macchiato", "category": "Coffee", "price": 30000, "stock": 45, "description": "Layer susu vanila lembut dengan espresso dan topping drizzle karamel manis." },
  { "name": "Manual Brew V60", "category": "Coffee", "price": 25000, "stock": 60, "description": "Kopi seduh manual dengan metode V60 untuk menonjolkan karakter rasa biji kopi seasonal." },
  { "name": "Espresso Tonic", "category": "Coffee", "price": 26000, "stock": 35, "description": "Minuman kopi segar yang mencampurkan espresso, air tonik, dan irisan lemon." },
  { "name": "Butterscotch Coffee", "category": "Coffee", "price": 28000, "stock": 40, "description": "Es kopi susu dengan cita rasa mentega dan karamel yang gurih dan unik." },
  { "name": "Magic", "category": "Coffee", "price": 28000, "stock": 25, "description": "Double ristretto dengan susu hangat, memberikan rasa kopi yang lebih intens dari latte." },

  { "name": "Artisan Matcha Latte", "category": "Tea", "price": 32000, "stock": 40, "description": "Bubuk matcha Jepang murni kualitas premium yang dicampur dengan susu creamy." },
  { "name": "Earl Grey Milk Tea", "category": "Tea", "price": 25000, "stock": 50, "description": "Teh hitam Earl Grey beraroma jeruk bergamot yang dipadukan dengan susu lembut." },
  { "name": "Hojicha Latte", "category": "Tea", "price": 30000, "stock": 30, "description": "Teh hijau panggang Jepang dengan rasa nutty dan aroma smokey yang menenangkan." },
  { "name": "Lychee Tea Rose", "category": "Tea", "price": 24000, "stock": 45, "description": "Es teh leci segar dengan sentuhan aroma mawar dan potongan buah leci asli." },
  { "name": "Butterfly Pea Lemonade", "category": "Tea", "price": 22000, "stock": 40, "description": "Minuman bunga telang biru yang berubah warna menjadi ungu saat dicampur lemon segar." },
  { "name": "Signature Chocolate", "category": "Tea", "price": 25000, "stock": 60, "description": "Minuman cokelat pekat (dark chocolate) premium dengan rasa manis yang elegan." },
  { "name": "Tropical Peach", "category": "Tea", "price": 28000, "stock": 35, "description": "Teh buah tropis yang segar dengan potongan buah persik asli." },
  { "name": "Chamomile Mint", "category": "Tea", "price": 22000, "stock": 25, "description": "Teh herbal bunga chamomile yang menenangkan dipadukan dengan kesegaran daun mint." },
  { "name": "Strawberry Sparkle", "category": "Tea", "price": 26000, "stock": 40, "description": "Paduan puree stroberi asli dengan soda yang memberikan sensasi meletup di lidah." },
  { "name": "Red Velvet Latte", "category": "Tea", "price": 25000, "stock": 35, "description": "Minuman lembut dengan cita rasa kue red velvet yang manis dan memanjakan mata." },

  { "name": "Cromboloni Pistachio", "category": "Pastry", "price": 35000, "stock": 20, "description": "Pastry bulat renyah yang sedang tren dengan isian krim kacang pistachio melimpah." },
  { "name": "Classic Butter Croissant", "category": "Pastry", "price": 22000, "stock": 30, "description": "Croissant klasik Prancis yang renyah di luar, lembut di dalam, dan sangat buttery." },
  { "name": "Almond Croissant", "category": "Pastry", "price": 28000, "stock": 15, "description": "Croissant dengan isian pasta almond manis dan taburan irisan kacang almond panggang." },
  { "name": "Pain Au Chocolat", "category": "Pastry", "price": 26000, "stock": 20, "description": "Pastry berlapis yang diisi dengan batangan cokelat hitam berkualitas." },
  { "name": "Sea Salt Brownie", "category": "Pastry", "price": 20000, "stock": 25, "description": "Brownies cokelat panggang yang padat dengan taburan garam laut untuk penyeimbang rasa." },
  { "name": "Banana Bread Walnut", "category": "Pastry", "price": 22000, "stock": 15, "description": "Roti pisang panggang yang lembap dengan tekstur renyah dari kacang walnut." },
  { "name": "Cinnamon Roll", "category": "Pastry", "price": 25000, "stock": 18, "description": "Roti gulung kayu manis dengan aroma rempah yang kuat dan frosting cream cheese lumer." },
  { "name": "Soft Cookies Choco Chip", "category": "Pastry", "price": 18000, "stock": 40, "description": "Cookies bertekstur lembut dan kenyal dengan taburan choco chip cokelat leleh." },
  { "name": "Garlic Cheese Bread", "category": "Pastry", "price": 25000, "stock": 12, "description": "Roti gurih dengan aroma mentega bawang putih yang kuat dan keju yang melimpah." },
  { "name": "Scone with Strawberry Jam", "category": "Pastry", "price": 24000, "stock": 20, "description": "Camilan klasik Inggris yang disajikan dengan selai stroberi segar dan mentega." },

  { "name": "Nasi Goreng Riyadh", "category": "Food", "price": 35000, "stock": 50, "description": "Nasi goreng rempah khas rumah dengan topping telur mata sapi dan sate ayam." },
  { "name": "Chicken Nanban Rice Bowl", "category": "Food", "price": 38000, "stock": 30, "description": "Nasi hangat dengan ayam goreng tepung renyah dan siraman saus tartar gurih." },
  { "name": "Beef Teriyaki Bowl", "category": "Food", "price": 42000, "stock": 25, "description": "Irisan daging sapi pilihan yang dimasak dengan saus teriyaki manis gurih di atas nasi." },
  { "name": "Aglio Olio Chicken", "category": "Food", "price": 32000, "stock": 20, "description": "Pasta tumis bawang putih dan cabai kering yang disajikan dengan potongan ayam panggang." },
  { "name": "Spaghetti Carbonara", "category": "Food", "price": 35000, "stock": 20, "description": "Pasta dengan saus krim susu yang kental, keju parmesan, dan potongan smoked beef." },
  { "name": "Mix Platter", "category": "Food", "price": 40000, "stock": 30, "description": "Piring sharing berisi kentang goreng, sosis, dan cireng renyah dengan bumbu rujak." },
  { "name": "Classic Cheeseburger", "category": "Food", "price": 45000, "stock": 15, "description": "Burger dengan daging sapi juicy, keju cheddar lumer, sayuran segar, dan kentang goreng." },
  { "name": "Chicken Wings Honey Spicy", "category": "Food", "price": 32000, "stock": 25, "description": "6 potong sayap ayam goreng dengan balutan saus madu pedas yang meresap." },
  { "name": "Truffle Fries", "category": "Food", "price": 28000, "stock": 40, "description": "Kentang goreng renyah yang diberi aroma mewah minyak truffle dan parutan keju." },
  { "name": "Cireng Salted Egg", "category": "Food", "price": 25000, "stock": 30, "description": "Camilan cireng renyah lokal yang di-upgrade dengan siraman saus telur asin gurih." }
];

async function seedProducts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
  });

  try {
    // Clear existing products and reset AUTO_INCREMENT
    await connection.execute('DELETE FROM products');
    await connection.execute('ALTER TABLE products AUTO_INCREMENT = 1');
    console.log('✅ Cleared existing products and reset AUTO_INCREMENT');

    // Insert sample products
    for (const product of sampleProducts) {
      await connection.execute(
        'INSERT INTO products (name, category, price, stock, description, image_url) VALUES (?, ?, ?, ?, ?, NULL)',
        [product.name, product.category, product.price, product.stock, product.description]
      );
      console.log(`  ➕ Added: ${product.name} (${product.category})`);
    }

    console.log(`\n✅ Seeded ${sampleProducts.length} products!`);
    console.log('📦 Categories: Coffee, Tea, Food, Pastry');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

seedProducts();
