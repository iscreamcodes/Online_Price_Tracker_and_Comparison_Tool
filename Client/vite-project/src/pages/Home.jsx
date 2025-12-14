// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { fetchAllProducts } from "../api/productsApi";
import { useAuth } from "../api/AuthProvider";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  // Use the same logic as Profile component
  const nestedUser = user?.user || user;
  
  // Debug: log the user object to see the actual structure
  console.log("Home user object:", user);
  console.log("Home nestedUser:", nestedUser);

  useEffect(() => {
    if (!query.trim()) return;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const apiData = await fetchAllProducts(query);
        console.log("🔄 Raw API response:", apiData); // Debug log
        
        const data = transformProducts(apiData);
        console.log("🔄 Transformed products:", data); // Debug log
        
        setProducts(data);
        
        // Save to localStorage for session persistence
        localStorage.setItem('lastSearchQuery', query);
        localStorage.setItem('lastSearchResults', JSON.stringify(data));
      } catch (error) {
        console.error("❌ Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [query]);

  const transformProducts = (apiData) => {
    if (!apiData) return [];
    
    console.log("🔄 Transforming API data:", apiData); // Debug log

    // 🎯 FIX: Handle the actual backend response structure
    // Backend sends { products: array, message, query, totalFromDB, totalNew }
    const productsArray = apiData.products || apiData || [];
    
    if (!Array.isArray(productsArray)) {
      console.error("❌ Expected array but got:", typeof productsArray);
      return [];
    }

    return productsArray.map((product, index) => {
      // 🎯 FIX: Use the actual field names from backend
      const transformedProduct = {
        _id: product._id || product.id || `product-${index}-${Date.now()}`,
        name: product.name || product.title || "Unknown Product",
        price: product.price || product.Listing_Price || 0,
        currency: product.currency || product.Listing_Currency || "KES",
        store: product.store || product.Listing_Store_Name || "Unknown Store",
        image: optimizeImageUrl(product.image || product.Listing_Image_URL, product.store),
        url: product.url || product.Listing_URL || "#",
        lastUpdated: product.lastUpdated || product.Listing_Last_Updated,
        productId: product.productId || null
      };
      
      console.log(`🔄 Transformed product ${index}:`, transformedProduct.name); // Debug log
      return transformedProduct;
    }).filter(product => 
      product.name && 
      product.name !== "Unknown Product" && 
      product.price > 0
    );
  };

  // 🎯 SIMPLIFIED image optimization
  const optimizeImageUrl = (url, store) => {
    if (!url || url === '/placeholder.jpg' || url === '/placeholder-image.jpg') {
      return '/placeholder-image.jpg';
    }

    // Handle Jumia images
    if (store?.toLowerCase().includes('jumia')) {
      if (url.startsWith('//')) {
        url = 'https:' + url;
      } else if (!url.startsWith('http')) {
        url = `https://ke.jumia.is${url.startsWith('/') ? '' : '/'}${url}`;
      }
      
      // Basic Jumia image optimization
      if (url.includes('jumia.is') && !url.includes('/unsafe/')) {
        // Try to create a optimized version
        const filenameMatch = url.match(/\/([^/]+\.(jpg|jpeg|png|webp))$/i);
        if (filenameMatch) {
          return `https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/${filenameMatch[1]}`;
        }
      }
    }

    return url;
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setQuery(searchTerm.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Get user display name - consistent with Profile component
  const getDisplayName = () => {
    if (!nestedUser) return "User";
    return nestedUser?.User_name || nestedUser?.name || "User";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/70 to-white text-[#004d40] font-poppins relative overflow-hidden">
      {/* Soft background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="background"
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      <div className="relative p-6 flex flex-col items-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl text-center mb-10 bg-white/30 backdrop-blur-md rounded-2xl shadow-lg p-10 border border-white/40"
        >
          <h1 className="text-5xl font-bold mb-4 text-[#00332c]">
            Track Prices, Save Money
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Monitor product prices across multiple stores and get instant alerts when
            prices drop. Never miss a deal again with our intelligent price tracking system.
          </p>
        </motion.div>

        {/* User Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-6 bg-white/60 backdrop-blur-md px-6 py-3 rounded-xl shadow-sm border border-white/40"
        >
          {user ? (
            <>
              <p className="text-green-700 font-semibold text-lg">
                Welcome back, {getDisplayName()}!
              </p>
              <p className="text-gray-600">Ready to track and save?</p>
            </>
          ) : (
            <p className="text-[#004d40] font-semibold text-lg">
              Create an account to track products and view price history
            </p>
          )}
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mb-12 w-full"
        >
          <div className="relative w-full max-w-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for laptops, phones, electronics..."
              className="w-full bg-white/80 backdrop-blur-lg border border-green-300 rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 text-lg shadow-sm"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-3 top-2.5 bg-[#004d40] hover:bg-green-900 text-white px-6 py-2 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center mb-8">
            <p className="text-gray-500 text-lg animate-pulse mb-2">
              🔍 Searching for <span className="font-semibold text-[#004d40]">{query}</span>...
            </p>
            <p className="text-sm text-gray-400">
              Scanning Jumia, Kilimall, Amazon, and Jiji...
            </p>
          </div>
        )}

        {/* Products Section */}
        {!loading && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-7xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#004d40]">
                Search Results for "{query}"
              </h2>
              <span className="text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                {products.length} products found
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && query && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12 bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/40"
          >
            <p className="text-xl text-gray-600 mb-2">
              No products found for "{query}"
            </p>
            <p className="text-gray-500">
              Try searching for different terms like "laptop", "phone", or "electronics"
            </p>
          </motion.div>
        )}

        {/* Initial State */}
        {!loading && !query && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12 bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-sm border border-white/40"
          >
            <p className="text-xl text-gray-600 mb-2">
              Find the best deals across stores
            </p>
            <p className="text-gray-500">
              Search for any product to see prices from Jumia, Kilimall, Amazon, and Jiji
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}