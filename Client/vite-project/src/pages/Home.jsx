// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { fetchAllProducts } from "../api/productsApi";
import Navbar from "../components/Navbar";
import { useAuth } from "../api/useAuth";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const { user } = useAuth();

  // Remove the useEffect that loads saved search from localStorage
  // This prevents auto-searching on page load

  useEffect(() => {
    if (!query.trim()) return;

    const loadProducts = async () => {
      setLoading(true);
      try {
        const apiData = await fetchAllProducts(query);
        const data = transformProducts(apiData);
        setProducts(data);
        
        // Optional: Save to localStorage only if you want to persist during session
        // But don't auto-load on refresh
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

  const transformProducts = (data) => {
    if (!data) return [];

    // Helper: clean and fix Jumia URLs
    const optimizeJumiaImageUrl = (url, store) => {
      if (!url || url === '/placeholder-image.jpg') {
        return '/placeholder-image.jpg';
      }

      if (store?.toLowerCase().includes('jumia')) {
        if (url.startsWith('//')) {
          url = 'https:' + url;
        } else if (!url.startsWith('http')) {
          url = `https://ke.jumia.is${url.startsWith('/') ? '' : '/'}${url}`;
        }

        if (url.includes('jumia.is/unsafe')) {
          url = url.split('?')[0];
          return url;
        }

        const match = url.match(/product\/[\d/]+\.jpg/);
        if (match) {
          return `https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/${match[0]}`;
        }
      }

      return url;
    };

    // Helper: extract the best available image
    const extractImage = (product) => {
      const imageUrl = product?.["data-src"] ||
        product?.src ||
        product?.image ||
        product?.img ||
        product?.thumbnail ||
        "/placeholder-image.jpg";
      
      return optimizeJumiaImageUrl(imageUrl, product?.store);
    };

    // Handle grouped products
    if (data.groupedProducts) {
      return (data.groupedProducts || []).flatMap((group) =>
        (group.products || []).map((product) => ({
          _id: product?.id || product?._id || Math.random().toString(),
          name: product?.title || product?.name || 'Unknown Product',
          price: product?.price || 0,
          currency: product?.currency || "USD",
          store: product?.store || "Unknown Store",
          image: extractImage(product),
          url: product?.url || "#",
        }))
      );
    }

    // Handle flat array
    if (Array.isArray(data)) {
      return data.map((product) => ({
        _id: product?.id || product?._id || Math.random().toString(),
        name: product?.title || product?.name || 'Unknown Product',
        price: product?.price || 0,
        currency: product?.currency || "USD",
        store: product?.store || "Unknown Store",
        image: extractImage(product),
        url: product?.url || "#",
      }));
    }

    return [];
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setQuery(searchTerm.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Remove clearSearch function since we're removing the clear button

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

      <Navbar />

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
                Welcome back, {user.user?.User_name}!
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
              placeholder="Enter product name..."
              className="w-full bg-white/80 backdrop-blur-lg border border-green-300 rounded-2xl px-6 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 text-lg shadow-sm"
            />
            <button
              onClick={handleSearch}
              className="absolute right-3 top-2.5 bg-[#004d40] hover:bg-green-900 text-white px-6 py-2 rounded-xl transition-all shadow-md"
            >
              Search
            </button>
            
            {/* Removed the clear button entirely */}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <p className="text-center text-gray-500 text-lg animate-pulse">
            🔍 Searching for <span className="font-semibold text-[#004d40]">{query}</span>...
          </p>
        )}

        {/* Products Section */}
        {!loading && products && products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#004d40]">
                Search Results for "{query}"
              </h2>
              <span className="text-gray-600 bg-white/80 px-3 py-1 rounded-full">
                {products.length} products found
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((product, i) => (
                <ProductCard key={product._id || i} product={product} />
              ))}
            </div>
          </motion.div>
        ) : (
          !loading &&
          query && (
            <p className="text-center text-gray-400 mt-10 text-lg">
              No products found for "{query}". Try another search term.
            </p>
          )
        )}

        {!loading && !query && (!products || products.length === 0) && (
          <div className="text-center mt-12 text-gray-600">
            <p className="text-lg mb-3">Find the best deals across stores </p>
            <p className="text-gray-500">
              Search for any product to see prices from multiple stores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}