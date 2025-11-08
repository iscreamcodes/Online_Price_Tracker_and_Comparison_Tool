// src/components/TrackButton.jsx
import { useState } from "react";
import { trackProduct } from "../api/historyApi";
import { useAuth } from "../api/useAuth";

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tracked, setTracked] = useState(false);
  const { user } = useAuth();

  const userId = user?.user?._id;
  const trackingReady = product.priceHistorySaved ?? true; // Default true for old listings

  const handleTrackProduct = async () => {
    if (!trackingReady) return alert("⏳ Product is not ready to track yet.");
    try {
      setLoading(true);
      setError("");

      if (!userId) return setError("Please log in to track products");
      const listingId = product._id || product.id;

      await trackProduct(userId, listingId);
      setTracked(true);
      alert(`📌 ${product.name} is now being tracked!`);
    } catch (err) {
      console.error("❌ Track product error:", err);
      setError(err.response?.data?.error || "Failed to track product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white p-4 rounded-xl shadow-md">
      {/* Track button */}
      <button
        onClick={handleTrackProduct}
        disabled={loading || tracked || !userId || !trackingReady}
        className={`px-3 py-1 rounded-full ${
          tracked
            ? "bg-green-600 text-white"
            : !trackingReady
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {tracked ? "✅ Tracked" : !trackingReady ? "⏳ Waiting..." : "📌 Track"}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
