import { useEffect, useState } from "react";
import ProductCard from "./components/ProductCard";
import { fetchAllProducts } from "./components/api/productsApi";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [query, setQuery] = useState("iphone");

  useEffect(() => {
    let abort = false;
  
    const loadProducts = async () => {
      if (!query || query.trim() === "") return; // avoid blank calls
  
      console.log("🔍 Fetching products for:", query);
      setLoading(true);
      try {
        const data = await fetchAllProducts(query);
        if (!abort) {
          setProducts(data);
        }
      } catch (error) {
        if (!abort) {
          console.error("❌ Failed to fetch products:", error);
          setProducts([]); // Clear products on error
        }
      } finally {
        if (!abort) {
          setLoading(false);
        }
      }
    };
  
    // prevent multiple triggers during dev or re-render
    const timer = setTimeout(() => loadProducts(), 300);
  
    return () => {
      abort = true;
      clearTimeout(timer);
    };
  }, [query]);
  
  
  // Handle search button click
  const handleSearch = () => {
    if (query.trim() !== "") {
      // Trigger the useEffect by updating state
      setQuery(query.trim());
    }
  };

  // Handle Enter key in search input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Product Comparison
      </h1>

      {/* Search box */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for a product..."
          className="w-80 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500 text-lg animate-pulse">
          Loading products...
        </p>
      )}

      {/* Products grid */}
      {!loading && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id || i} product={product} />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-400 mt-10">No products found.</p>
        )
      )}
    </div>
  );
}