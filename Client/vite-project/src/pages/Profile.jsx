// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../api/useAuth";
import History from "../pages/History.jsx";
import { ShoppingBag, DollarSign, Eye, Bell } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const nestedUser = user?.user;
  const [activeTab, setActiveTab] = useState("tracked");

  // Get real tracked products count for stats
  const trackedProductsCount = nestedUser?.User_preferences?.tracked_products?.length || 0;

  // Real stats based on user data
  const stats = [
    { label: "Tracked Products", value: trackedProductsCount, icon: <ShoppingBag size={18} /> },
    { label: "Total Savings", value: "KES 0", icon: <DollarSign size={18} /> },
    { label: "Products Viewed", value: "0", icon: <Eye size={18} /> },
    { label: "Price Alerts", value: "0", icon: <Bell size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-[#004d40] font-poppins p-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 mb-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#004d40] text-white flex items-center justify-center text-3xl font-bold mb-3">
            {nestedUser?.User_name?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-semibold mb-1">
            {nestedUser?.User_name || "User"}
          </h2>
          <p className="text-gray-600 mb-6">{nestedUser?.User_email}</p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-green-50 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center border border-green-100"
              >
                <div className="text-green-700 mb-1">{item.icon}</div>
                <div className="font-semibold text-lg">{item.value}</div>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab("tracked")}
            className={`px-6 py-2 rounded-l-xl border ${
              activeTab === "tracked"
                ? "bg-[#004d40] text-white"
                : "bg-white text-[#004d40]"
            }`}
          >
            Tracked Products
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-r-xl border ${
              activeTab === "history"
                ? "bg-[#004d40] text-white"
                : "bg-white text-[#004d40]"
            }`}
          >
            Browsing History
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {activeTab === "tracked" ? (
            <PriceHistoryWithProducts />
          ) : (
            <History />
          )}
        </div>
      </div>
    </div>
  );
}

// This component combines tracked products with their price history
function PriceHistoryWithProducts() {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [fullPriceHistory, setFullPriceHistory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedProduct, setExpandedProduct] = useState(null);

  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading price history...</p>
      </div>
    );
  }

  if (trackedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tracked Products</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Start tracking products from the home page to see their price history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {trackedProducts.map((product, index) => {
        const allHistory = (fullPriceHistory[product.productId] || []).sort(
          (a, b) =>
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
        );
        const latestPrice = allHistory[0];

        return (
          <div
            key={product.productId}
            className="bg-white border border-green-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
          >
            {/* Product Header */}
            <div
              onClick={() => toggleExpand(product.productId)}
              className="cursor-pointer bg-green-50 px-6 py-4 flex justify-between items-center hover:bg-green-100 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <img
                  src={product.image || "/placeholder-image.jpg"}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-[#004d40] text-lg">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {product.store} • Current: {product.currency}{" "}
                    {latestPrice
                      ? (latestPrice.price || latestPrice.History_Price)?.toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <span className="text-green-700 font-semibold text-lg">
                {expandedProduct === product.productId ? "▲" : "▼"}
              </span>
            </div>

            {/* Price History Section */}
            {expandedProduct === product.productId && (
              <div className="border-t border-green-100">
                <div className="px-6 py-4">
                  <h4 className="font-semibold text-[#004d40] mb-3">Price History</h4>
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
  );
}