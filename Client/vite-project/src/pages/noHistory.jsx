// src/pages/History.jsx
import { useState, useEffect } from "react";
import { Eye, Clock, Trash2 } from "lucide-react";
import { useAuth } from "../api/useAuth";
import axios from "axios";

export default function History() {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTrackedProducts = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/user/tracked-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackedProducts(response.data.trackedProducts || []);
    } catch (err) {
      console.error("Error fetching tracked products:", err);
    } finally {
      setLoading(false);
    }
  };

  const untrackProduct = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/user/untrack/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrackedProducts(prev => prev.filter(item => item.Tracked_product_id !== productId));
    } catch (err) {
      console.error("Error untracking product:", err);
      alert("Failed to untrack product");
    }
  };

  useEffect(() => {
    fetchTrackedProducts();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <Eye size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Sign In Required</h3>
        <p className="text-gray-500 mb-6">Please sign in to view your tracked products.</p>
        <a href="/login" className="bg-[#004d40] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition">
          Sign In
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004d40] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your tracked products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Clock className="mx-auto text-[#004d40] mb-4" size={40} />
        <h1 className="text-3xl font-bold text-gray-900">Tracked Products</h1>
        <p className="text-gray-600 mt-2">Products you're monitoring for price changes</p>
      </div>

      {trackedProducts.length > 0 ? (
        <div className="grid gap-4">
          {trackedProducts.map((product) => (
            <div key={product.Tracked_product_id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {product.Tracked_image && (
                    <img
                      src={product.Tracked_image}
                      alt={product.Tracked_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.Tracked_name}</h3>
                    <p className="text-sm text-gray-600">{product.Tracked_store}</p>
                    <p className="text-lg font-bold text-[#004d40]">
                      {product.Tracked_currency} {product.Tracked_price_history?.[0]?.History_price}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => untrackProduct(product.Tracked_product_id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Untrack product"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Eye size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tracked Products</h3>
          <p className="text-gray-500 mb-6">Start tracking products to see them here.</p>
          <a href="/" className="bg-[#004d40] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition">
            Browse Products
          </a>
        </div>
      )}
    </div>
  );
}