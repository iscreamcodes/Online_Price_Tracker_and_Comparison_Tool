// seeders/initialData.js - UPDATED
import mongoose from 'mongoose';
import Category from './Model/Category.js';
import Store from './Model/Store.js';

export async function seedInitialData() {
  console.log('🌱 Starting data seeding...');
  
  // Seed Categories
  const categories = [
    { Category_code: 'CAT_ELECTRONICS', Category_Name: 'Electronics', Category_Description: 'Electronic devices and accessories' },
    { Category_code: 'CAT_PHONES', Category_Name: 'Mobile Phones', Category_Description: 'Smartphones and mobile devices' },
    { Category_code: 'CAT_COMPUTERS', Category_Name: 'Computers & Laptops', Category_Description: 'Computers, laptops and accessories' },
    { Category_code: 'CAT_AUDIO', Category_Name: 'Audio & Headphones', Category_Description: 'Audio equipment and headphones' },
    { Category_code: 'CAT_HOME', Category_Name: 'Home Appliances', Category_Description: 'Home and kitchen appliances' },
    { Category_code: 'CAT_FASHION', Category_Name: 'Fashion', Category_Description: 'Clothing and fashion accessories' }
  ];

  for (const cat of categories) {
    try {
      await Category.findOneAndUpdate(
        { Category_code: cat.Category_code },
        cat,
        { upsert: true, new: true }
      );
      console.log(`✅ Category: ${cat.Category_Name}`);
    } catch (error) {
      console.error(`❌ Failed to seed category ${cat.Category_Name}:`, error.message);
    }
  }
  console.log('✅ Categories seeded');

  // Seed Stores - Create new instances instead of findOneAndUpdate
 
    const stores = [
        { Store_Name: "Jumia", Store_code: "JUM", Store_URL: "https://www.jumia.co.ke" },
        { Store_Name: "Kilimall", Store_code: "KIL", Store_URL: "https://www.kilimall.co.ke" },
        { Store_Name: "Amazon", Store_code: "AMZ", Store_URL: "https://www.amazon.com" },
        { Store_Name: "Jiji", Store_code: "JIJ", Store_URL: "https://jiji.co.ke" },
        { Store_Name: "Masoko", Store_code: "MAS", Store_URL: "https://www.masoko.com" },
      ];
      
  

  for (const storeData of stores) {
    try {
      // Check if store already exists
      const existingStore = await Store.findOne({ Store_Name: storeData.Store_Name });
      
      if (existingStore) {
        console.log(`ℹ️ Store already exists: ${storeData.Store_Name} (${existingStore.Store_code})`);
      } else {
        // Create new store (auto-generates Store_code)
        const store = new Store(storeData);
        await store.save();
        console.log(`🆕 Created store: ${store.Store_Name} (${store.Store_code})`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed store ${storeData.Store_Name}:`, error.message);
    }
  }
  console.log('✅ Stores seeded');
}

// Make it executable directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/priceTracker';
  
  (async () => {
    try {
      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB connected successfully');

      await seedInitialData();
      
      console.log('🎉 Seeder completed successfully!');
      
    } catch (error) {
      console.error('❌ Seeder failed:', error);
    } finally {
      await mongoose.disconnect();
      console.log('🔌 MongoDB disconnected');
    }
  })();
}