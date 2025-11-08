// src/components/History.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../api/useAuth";

export default function History() {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [fullPriceHistory, setFullPriceHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedProduct, setExpandedProduct] = useState(null);

  const { user, authLoading } = useAuth();
  const nestedUser = user?.user;

  useEffect(() => {
    if (nestedUser && nestedUser.User_preferences?.tracked_products) {
      setLoading(true);
      const allTrackedProducts = nestedUser.User_preferences.tracked_products;
      setTrackedProducts(allTrackedProducts);
      fetchFullPriceHistory(allTrackedProducts);
    } else {
      setTrackedProducts([]);
    }
  }, [nestedUser]);

  const fetchFullPriceHistory = async (trackedProducts) => {
    try {
      const historyMap = {};
      const token = localStorage.getItem("token");
      if (!token) return;

      for (const product of trackedProducts) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/history/${product.productId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const historyData = await response.json();
            historyMap[product.productId] = historyData.data || [];
          } else {
            historyMap[product.productId] = [];
          }
        } catch {
          historyMap[product.productId] = [];
        }
      }

      setFullPriceHistory(historyMap);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch price history");
      setLoading(false);
    }
  };

  const toggleExpand = (productId) => {
    setExpandedProduct((prev) => (prev === productId ? null : productId));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/70 to-white text-center text-gray-600 p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/70 to-white text-center p-6 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-200">
          <p className="text-red-500 text-lg">Please log in to view your price history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/70 to-white p-6 font-poppins">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#004d40] mb-8 text-center">
           Your Price History
        </h1>

        {trackedProducts.length === 0 && !loading && (
          <div className="text-center mt-10">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-200 max-w-md mx-auto">
              <p className="text-gray-600 text-lg mb-4">No tracked products yet.</p>
              <p className="text-gray-500 text-sm">
                Track products from the home page to start recording their price history.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center mt-10">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-green-200 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading price history...</p>
            </div>
          </div>
        )}

        {!loading && trackedProducts.length > 0 && (
          <div className="space-y-6">
            {trackedProducts.map((product, index) => {
              const allHistory = (fullPriceHistory[product.productId] || []).sort(
                (a, b) =>
                  new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
              );
              const latestPrice = allHistory[0];

              return (
                <div
                  key={product.productId}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-green-200 overflow-hidden hover:shadow-xl transition"
                >
                  {/* Header */}
                  <div
                    onClick={() => toggleExpand(product.productId)}
                    className="cursor-pointer bg-green-50 px-6 py-4 flex justify-between items-center hover:bg-green-100 transition"
                  >
                    <div className="flex-1">
                      <h2 className="font-semibold text-[#004d40] text-lg">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.store} • Current: {product.currency}{" "}
                        {latestPrice
                          ? (latestPrice.price || latestPrice.History_Price)?.toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <span className="text-green-700 font-semibold text-lg">
                      {expandedProduct === product.productId ? "▲" : "▼"}
                    </span>
                  </div>

                  {/* Collapsible section */}
                  {expandedProduct === product.productId && (
                    <div className="border-t border-green-100">
                      <div className="px-6 py-4 bg-white">
                        <h3 className="font-semibold text-[#004d40] mb-3">Price History</h3>
                        {allHistory.length > 0 ? (
                          <div className="space-y-2">
                            {allHistory.map((record, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-green-50 transition"
                              >
                                <span className="text-gray-700">
                                  {new Date(
                                    record.date || record.createdAt
                                  ).toLocaleDateString()}
                                  {i === 0 && (
                                    <span className="ml-2 text-green-500 text-sm font-medium">
                                      (Latest)
                                    </span>
                                  )}
                                </span>
                                <span className="font-semibold text-[#004d40] text-lg">
                                  {product.currency}{" "}
                                  {(record.price || record.History_Price)?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">
                            No price history recorded yet.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}