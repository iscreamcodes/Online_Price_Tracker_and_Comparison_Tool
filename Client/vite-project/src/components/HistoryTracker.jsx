// src/components/TrackButton.jsx
import { useState } from "react";
import { trackProduct } from "../api/historyApi";
import { useAuth } from "../api/AuthContext";

export default function TrackButton({ listingId, onTracked }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleTrackProduct = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!user) {
        setError("Please log in to track products");
        return;
      }

      const userId = user._id;
      const response = await trackProduct(userId, listingId);
      
      console.log("✅ Product tracked:", response);
      
      if (onTracked) {
        onTracked(response);
      }
      
      alert("Product tracked successfully! 🎉");
      
    } catch (err) {
      console.error("❌ Error tracking product:", err);
      setError(err.response?.data?.error || "Failed to track product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleTrackProduct}
        disabled={loading || !user}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          loading || !user
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Tracking..." : "📌 Track Product"}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {!user && <p className="text-orange-500 text-sm mt-2">Please log in to track products</p>}
    </div>
  );
}