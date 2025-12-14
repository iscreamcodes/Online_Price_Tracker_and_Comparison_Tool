// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../api/AuthProvider";
import { ShoppingBag, DollarSign, Eye, Bell, User, TrendingDown } from "lucide-react";
import { getTrackedProducts } from "../api/historyApi";
import TrackedProductsFull from "./TrackedProductsFull.jsx";

export default function Profile() {
  const { user, authLoading } = useAuth();
  const nestedUser = user?.user || user;

  const [activeTab, setActiveTab] = useState("tracked");
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [loadingTracked, setLoadingTracked] = useState(true);

  // Fetch tracked products from backend
  useEffect(() => {
    const fetchTracked = async () => {
      if (!nestedUser?.id) return;
      try {
        setLoadingTracked(true);
        const products = await getTrackedProducts(nestedUser.id);
        setTrackedProducts(products);
        console.log("Fetched tracked products:", products);
      } catch (err) {
        console.error("Error fetching tracked products:", err);
      } finally {
        setLoadingTracked(false);
      }
    };

    fetchTracked();
  }, [nestedUser?.id]);

  // Loading state
  if (authLoading || loadingTracked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d40] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Not Logged In</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
          <div className="flex gap-4 justify-center">
            <a
              href="/login"
              className="bg-[#004d40] text-white px-6 py-2 rounded-lg hover:bg-green-900 transition"
            >
              Login
            </a>
            <a
              href="/register"
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total savings (placeholder)
  const calculateTotalSavings = () => {
    // Add actual logic if needed
    return "KES 0";
  };

  // Stats using trackedProducts from backend
  const stats = [
    {
      label: "Tracked Products",
      value: trackedProducts.length,
      icon: <ShoppingBag size={20} />,
    },
    {
      label: "Total Savings",
      value: calculateTotalSavings(),
      icon: <TrendingDown size={20} />,
    },
    {
      label: "Products Viewed",
      value: nestedUser?.viewed_products_count || "0",
      icon: <Eye size={20} />,
    },
    {
      label: "Price Alerts",
      value: nestedUser?.alerts_count || "0",
      icon: <Bell size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-[#004d40] font-poppins p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 mb-8 text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-[#004d40] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold mb-3">
            {nestedUser?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">
            {nestedUser?.name || "User"}
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {nestedUser?.email}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((item, idx) => (
              <div
                key={idx}
                className="bg-green-50 p-3 sm:p-4 rounded-xl shadow-sm flex flex-col items-center justify-center border border-green-100"
              >
                <div className="text-green-700 mb-1">{item.icon}</div>
                <div className="font-semibold text-base sm:text-lg">{item.value}</div>
                <p className="text-xs sm:text-sm text-gray-500 text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("tracked")}
              className={`px-4 sm:px-6 py-2 rounded-lg transition ${
                activeTab === "tracked"
                  ? "bg-[#004d40] text-white shadow"
                  : "text-[#004d40] hover:bg-gray-50"
              }`}
            >
              Tracked Products
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 sm:px-6 py-2 rounded-lg transition ${
                activeTab === "history"
                  ? "bg-[#004d40] text-white shadow"
                  : "text-[#004d40] hover:bg-gray-50"
              }`}
            >
              Price History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          {activeTab === "tracked" ? (
            <TrackedProductsFull trackedProducts={trackedProducts} refreshTracked={() => {
              // Allow TrackedProductsFull to refresh stats if needed
              setTrackedProducts([...trackedProducts]);
            }} />
          ) : (
            <div className="text-center text-gray-500 py-12">
              Price History Tab Content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
