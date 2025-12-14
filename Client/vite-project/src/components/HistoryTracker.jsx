// src/components/TrackButton.jsx
import { useState } from "react";
import { trackProduct } from "../api/historyApi";
import { useAuth } from "../api/AuthContext";

export default function TrackButton({ listingId, onTracked }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // for success/error messages
  const { user } = useAuth();

  const handleTrackProduct = async () => {
    if (!user) {
      setMessage("⚠️ Please log in to track products");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const userId = user._id;
      const response = await trackProduct(userId, listingId);

      // Call parent callback if provided
      if (onTracked) onTracked(response);

      setMessage("✅ Product tracked successfully!");
    } catch (err) {
      console.error("❌ Error tracking product:", err);
      setMessage(err.response?.data?.error || "❌ Failed to track product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleTrackProduct}
        disabled={loading}
        aria-busy={loading}
        aria-disabled={loading || !user}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Tracking..." : "📌 Track Product"}
      </button>

      {message && (
        <p
          className={`mt-2 text-sm ${
            message.startsWith("✅") ? "text-green-500" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
