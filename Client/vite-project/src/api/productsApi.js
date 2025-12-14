import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/products",
  withCredentials: false,
});

// api/productsApi.js
export async function fetchAllProducts(query = "laptop") {
  try {
    console.log(`🟡 Fetching products for: "${query}"`);
    
    const res = await api.get(`/all-stores?q=${encodeURIComponent(query)}&save=true`);
    console.log("🧩 Backend response structure:", {
      hasProducts: !!res.data.products,
      productsCount: res.data.products?.length,
      totalFromDB: res.data.totalFromDB,
      totalNew: res.data.totalNew,
      message: res.data.message
    });

    // Return the entire response or just products
    return res.data.products || [];
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.response?.data || err.message);
    return [];
  }
}


// src/api/productsApi.js - Add this function
// api/productsApi.js - UPDATE fetchSavedListings
export async function fetchSavedListings(query = "", limit = 50) {
  try {
    console.log("🟡 Fetching saved listings from database...", { query, limit });
    
    const res = await api.get(`/all-stores?q=${encodeURIComponent(query)}&save=false`);
    
    console.log("💾 Saved listings response:", res.data);
    
    if (res.data.products) {
      console.log(`✅ Found ${res.data.products.length} saved products`);
      
      // Debug: Check product names
      res.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. "${product.name}" - ${product.store}`);
      });
      
      return res.data.products;
    } else {
      console.error("❌ No products in response");
      return [];
    }
  } catch (err) {
    console.error("❌ Failed to fetch saved listings:", err.response?.data || err.message);
    return [];
  }
}
