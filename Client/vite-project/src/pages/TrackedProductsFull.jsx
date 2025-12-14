// src/pages/TrackedProductsFull.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../api/AuthProvider";
import { Eye, Clock, Trash2, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { getTrackedProducts } from "../api/historyApi";

export default function TrackedProductsFull() {
  const { user } = useAuth();
  const userId = user?.user?.id || user?.id;

  const [trackedProducts, setTrackedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Load tracked products from backend
  const loadTrackedProducts = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const products = await getTrackedProducts(userId);
      setTrackedProducts(products);
    } catch (err) {
      console.error("Failed to load tracked products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackedProducts();
  }, [userId]);

  const refreshTrackedProducts = async () => {
    try {
      setRefreshing(true);
      await loadTrackedProducts();
    } catch (err) {
      console.error("Error refreshing tracked products:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const untrackProduct = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5000/api/products/untrack/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrackedProducts(prev => prev.filter(item => item.Tracked_product_id !== productId));
    } catch (err) {
      console.error("Error untracking product:", err);
      alert("Failed to untrack product");
    }
  };

  const togglePriceHistory = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculatePriceChange = (priceHistory) => {
    if (!priceHistory || priceHistory.length < 2) return null;
    
    const currentPrice = priceHistory[0]?.History_price;
    const previousPrice = priceHistory[1]?.History_price;
    
    if (!currentPrice || !previousPrice) return null;
    
    const change = currentPrice - previousPrice;
    const percentage = ((change / previousPrice) * 100).toFixed(1);
    
    return {
      change,
      percentage,
      isPositive: change < 0 // Negative change = price drop (good)
    };
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004d40] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your tracked products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-center flex-1">
          <Clock className="mx-auto text-[#004d40] mb-2" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
          <p className="text-gray-600">Products you're monitoring for price changes</p>
        </div>
      </div>

      {/* Product List */}
      {trackedProducts.length > 0 ? (
        <div className="grid gap-4">
          {trackedProducts.map((product) => {
            // Sort price history descending (latest first)
            const priceHistory = [...(product.Tracked_price_history || [])].sort(
              (a, b) => new Date(b.History_date) - new Date(a.History_date)
            );
            const currentPrice = priceHistory[0]?.History_price;
            const priceChange = calculatePriceChange(priceHistory);

            return (
              <div
                key={product.Tracked_product_id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Product Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {product.Tracked_image && product.Tracked_image !== "/placeholder-image.jpg" ? (
                        <img
                          src={product.Tracked_image}
                          alt={product.Tracked_name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => { e.target.src = "/placeholder-image.jpg"; }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Eye size={24} className="text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {product.Tracked_name || "Unknown Product"}
                        </h3>
                        <p className="text-sm text-gray-600">{product.Tracked_store || "Unknown Store"}</p>

                        <div className="flex items-center gap-4 mt-2">
                          {currentPrice && (
                            <p className="text-lg font-bold text-[#004d40]">
                              {product.Tracked_currency || "KES"} {currentPrice.toLocaleString()}
                            </p>
                          )}
                          {priceChange && (
                            <span className={`text-sm font-medium px-2 py-1 rounded ${
                              priceChange.isPositive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <TrendingUp size={14} className="inline mr-1" />
                              {priceChange.isPositive ? '↓' : '↑'} 
                              {Math.abs(priceChange.change).toLocaleString()} 
                              ({priceChange.isPositive ? '-' : '+'}{Math.abs(priceChange.percentage)}%)
                            </span>
                          )}
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Tracked since: {product.Tracked_since ? new Date(product.Tracked_since).toLocaleDateString() : "N/A"}
                          </span>
                        </div>

                        {priceHistory.length > 0 && (
                          <button
                            onClick={() => togglePriceHistory(product.Tracked_product_id)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                          >
                            {expandedProduct === product.Tracked_product_id ? (
                              <>
                                <ChevronUp size={16} /> Hide Price History
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} /> Show Price History ({priceHistory.length} records)
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => untrackProduct(product.Tracked_product_id)}
                      className="text-red-500 hover:text-red-700 p-2 transition-colors"
                      title="Untrack product"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {product.Tracked_url && product.Tracked_url !== "#" && (
                    <a
                      href={product.Tracked_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 mt-3 inline-block"
                    >
                      View From Store →
                    </a>
                  )}
                </div>

                {expandedProduct === product.Tracked_product_id && priceHistory.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} /> Price History
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {priceHistory.map((record, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            index === 0 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-white border border-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              index === 0 ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {product.Tracked_currency || "KES"} {record.History_price?.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(record.History_date)}
                              </div>
                            </div>
                          </div>
                          {index === 0 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {priceHistory.length === 1 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Only one price record available. More records will appear as prices change.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Eye size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tracked Products</h3>
          <p className="text-gray-500 mb-6">Start tracking products to see them here.</p>
          <a
            href="/"
            className="bg-[#004d40] text-white px-6 py-2 rounded-lg hover:bg-green-900 transition inline-block"
          >
            Browse Products
          </a>
        </div>
      )}
    </div>
  );
}
