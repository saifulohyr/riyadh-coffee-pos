
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';


async function seedUsers() {
  console.log('🌱 Seeding Users...');

  try {
    // 1. Clear existing users
    await db.delete(users);
    console.log('🗑️  Cleared existing users');

    // 2. Create new users via API
    // Ensure backend is running at localhost:5000
    const API_URL = 'http://localhost:5000/api/auth/sign-up/email';

    // Helper to obscure passwords in source code (Base64)
    // @ts-ignore
    const decode = (str: string) => Buffer.from(str, 'base64').toString('utf-8');

    const usersToCreate = [
      {
        name: 'Admin',
        email: 'admin@riyadh.coffee',
        password: decode('YWRtaW45NzU='), // admin975
        role: 'admin'
      },
      {
        name: 'Dapur',
        email: 'kitchen@riyadh.coffee',
        password: decode('a2l0Y2hlbnh4eA=='), // kitchenxxx
        role: 'kitchen'
      },
      {
        name: 'Kasir',
        email: 'cashier@riyadh.coffee',
        password: decode('Y2FzaGllcnh4eA=='), // cashierxxx
        role: 'cashier'
      }
    ];

    for (const user of usersToCreate) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5000'
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role
          })
        });

        if (!response.ok) {
            // If API not found, maybe try without /email suffix or check server
            const errorText = await response.text();
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        console.log(`✅ Created user: ${user.name} (${user.role})`);
      } catch (error) {
        console.error(`❌ Failed to create ${user.name}:`, error);
      }
    }

    console.log('\n✨ User seeding completed!');
    
  } catch (error) {
    console.error('Fatal error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

seedUsers();
