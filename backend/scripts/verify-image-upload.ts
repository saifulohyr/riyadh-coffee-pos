import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api';

async function verifyImageUpload() {
  console.log('🚀 Starting Image Upload Verification...');

  // 1. Create a tiny base64 image (1x1 pixel PNG)
  // Transparent 1x1 pixel
  const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

  const payload = {
    name: 'Verification Product',
    category: 'Coffee',
    price: 99999,
    stock: 10,
    description: 'This is a test product',
    imageUrl: base64Image
  };

  try {
    // 2. Send POST request
    console.log('Sending POST request to /products...');
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Request Failed:', data);
      process.exit(1);
    }

    console.log('✅ Product Created:', data);
    const productId = data.data.id;

    // 3. Verify Product Data (GET)
    console.log(`Fetching product ${productId}...`);
    const getResponse = await fetch(`${API_URL}/products/${productId}`);
    const product = (await getResponse.json()).data;
    
    console.log('Product Data:', product);

    if (!product.imageUrl || !product.imageUrl.startsWith('/uploads/')) {
      console.error('❌ Image URL is invalid:', product.imageUrl);
      process.exit(1);
    }

    console.log('✅ Image URL format is correct:', product.imageUrl);

    // 4. Verify file exists on disk
    // Assuming script is run from project root, uploads is in backend/uploads
    // We are running this via 'tsx scripts/...' inside backend folder usually
    
    // Url path: /uploads/prod-....png
    // File system path: e:\BWA\backend\uploads\prod-....png
    
    const relativePath = product.imageUrl.replace('/uploads', '');
    const absolutePath = path.join(process.cwd(), 'uploads', relativePath.replace(/^\//, ''));
    
    console.log(`Checking file existence at: ${absolutePath}`);

    if (fs.existsSync(absolutePath)) {
        console.log('✅ File exists on disk!');
    } else {
        console.error('❌ File NOT found on disk!');
        // Try checking relative to where we run
        console.log('Current CWD:', process.cwd());
        process.exit(1);
    }

    // 5. Cleanup (Delete product)
    console.log('Cleaning up...');
    await fetch(`${API_URL}/products/${productId}`, { method: 'DELETE' });
    
    // Optional: Delete the file too? Backend doesn't auto-delete files yet (common issue), but fine for now.
    // We can manually delete the file in this script to be clean.
    fs.unlinkSync(absolutePath);
    console.log('✅ Cleanup complete.');

  } catch (error) {
    console.error('❌ Verification Error:', error);
    process.exit(1);
  }
}

verifyImageUpload();
