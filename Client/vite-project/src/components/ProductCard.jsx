import { useState } from "react";
import { trackProduct } from "../api/historyApi";
import { useAuth } from "../api/useAuth";

// 🖼️ Local or hosted logo URLs (you can replace with CDN links if you prefer)
const storeLogos = {
  jumia: "/logos/jumia.png",
  kilimall: "/logos/kilimall.png",
  amazon: "/logos/amazon.png",
  masoko: "/logos/masoko.png",
  jiji: "/logos/jiji.png",
};

export default function ProductCard({ product }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tracked, setTracked] = useState(false);
  const { user } = useAuth();
  const userId = user?.user?._id;

  // 🎨 Tag color logic — includes Masoko & Jiji
  const getTagColor = (store = "") => {
    const s = store.toLowerCase();
    if (s.includes("jumia"))
      return "bg-orange-100 text-orange-700 border border-orange-400";
    if (s.includes("kilimall"))
      return "bg-red-100 text-red-700 border border-red-400";
    if (s.includes("amazon"))
      return "bg-yellow-100 text-yellow-700 border border-yellow-400";
    if (s.includes("masoko"))
      return "bg-blue-100 text-blue-700 border border-blue-400";
    if (s.includes("jiji"))
      return "bg-purple-100 text-purple-700 border border-purple-400";
    return "bg-green-100 text-[#004d40] border border-green-400";
  };

  // 🧩 Track product handler
  const handleTrackProduct = async () => {
    try {
      setLoading(true);
      setError("");
      if (!userId) return setError("Please log in to track products");

      const listingId = product._id || product.id;
      if (!listingId) return setError("Product ID not found");

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

  // 🏷️ Detect logo by store name
  const getStoreLogo = (store = "") => {
    const s = store.toLowerCase();
    if (s.includes("jumia")) return storeLogos.jumia;
    if (s.includes("kilimall")) return storeLogos.kilimall;
    if (s.includes("amazon")) return storeLogos.amazon;
    if (s.includes("masoko")) return storeLogos.masoko;
    if (s.includes("jiji")) return storeLogos.jiji;
    return null;
  };

  return (
    <div
      className="bg-white border border-green-200 rounded-xl p-4 flex flex-col items-center
                 hover:shadow-lg hover:scale-105 transition-transform duration-200 relative"
    >
      {/* 🏷️ Store tag with logo */}
      <div
        className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getTagColor(
          product.store
        )}`}
      >
        {getStoreLogo(product.store) && (
          <img
            src={getStoreLogo(product.store)}
            alt={product.store}
            className="w-4 h-4 rounded-full object-contain"
          />
        )}
        <span>{product.store}</span>
      </div>

      {/* 📌 Track Button */}
      <div className="absolute top-2 left-2">
        <button
          onClick={handleTrackProduct}
          disabled={loading || tracked || !userId}
          className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${
            tracked
              ? "bg-green-600 text-white border-green-600"
              : loading || !userId
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-[#004d40] text-white border-[#004d40] hover:bg-green-900"
          }`}
        >
          {tracked ? "✅ Tracked" : loading ? "..." : "📌 Track"}
        </button>
      </div>

      {/* 🖼️ Product image */}
      <img
        src={product.image || "/placeholder-image.jpg"}
        alt={product.name}
        className="w-36 h-36 object-contain mb-3 rounded-lg"
      />

      {/* 🏷️ Product name */}
      <h3 className="text-sm font-semibold text-center text-[#004d40]">
        {product.name?.length > 60
          ? product.name.slice(0, 60) + "..."
          : product.name}
      </h3>

      {/* 💵 Price */}
      <p className="text-green-700 font-bold mt-1">
        {product.currency} {product.price?.toLocaleString() || "N/A"}
      </p>

      {/* 🔗 View product link */}
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-xs text-[#004d40] hover:underline"
      >
        View Product
      </a>

      {/* ⚠️ Error / Info messages */}
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
      {!userId && !error && (
        <p className="text-orange-500 text-xs mt-1 text-center">Login to track</p>
      )}
    </div>
  );
}