import { useState, useEffect } from "react";
import TrackButton from "./TrackButton"; // ✅ Import the TrackButton component
import { useAuth } from "../api/AuthProvider";

// 🖼️ Store logos
const storeLogos = {
  jumia: "/logos/jumia.png",
  kilimall: "/logos/kilimall.png", 
  amazon: "/logos/amazon.png",
  masoko: "/logos/masoko.png",
  jiji: "/logos/jiji.png",
};

export default function ProductCard({ product, isAlreadyTracked = false, onTrackUpdate }) {
  const { user } = useAuth();
  
  const [message, setMessage] = useState({ text: "", type: "" });

  // Auto-hide success messages
  useEffect(() => {
    if (message.type === "success") {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle track success
  const handleTrackSuccess = () => {
    setMessage({ text: "Product tracked successfully! 🎉", type: "success" });
    if (onTrackUpdate) onTrackUpdate(product, true);
  };

  const getTagColor = (store = "") => {
    const s = store.toLowerCase();
    if (s.includes("jumia")) return "bg-orange-100 text-orange-700 border border-orange-400";
    if (s.includes("kilimall")) return "bg-red-100 text-red-700 border border-red-400";
    if (s.includes("amazon")) return "bg-yellow-100 text-yellow-700 border border-yellow-400";
    if (s.includes("masoko")) return "bg-blue-100 text-blue-700 border border-blue-400";
    if (s.includes("jiji")) return "bg-purple-100 text-purple-700 border border-purple-400";
    return "bg-green-100 text-[#004d40] border border-green-400";
  };

  const getStoreLogo = (store = "") => {
    const s = store.toLowerCase();
    return storeLogos[s] || null;
  };

  const formatPrice = (price, currency) => {
    if (!price) return "N/A";
    const formattedPrice = typeof price === "number" ? price.toLocaleString() : String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const symbols = { KES: "KSh ", USD: "$", EUR: "€", GBP: "£" };
    return `${symbols[currency] || `${currency} `}${formattedPrice}`;
  };

  const handleImageError = (e) => {
    e.target.src = "/placeholder-image.jpg";
  };

  return (
    <div
      className="bg-white border border-green-200 rounded-xl p-4 flex flex-col items-center
                 hover:shadow-lg hover:scale-105 transition-transform duration-200 relative
                 min-h-[320px] max-w-[280px] mx-auto"
    >
      {/* Store tag with logo */}
      <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${getTagColor(product.store)}`}>
        {getStoreLogo(product.store) && (
          <img
            src={getStoreLogo(product.store)}
            alt={product.store}
            className="w-4 h-4 rounded-full object-contain"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}
        <span className="max-w-[80px] truncate">{product.store}</span>
      </div>

      {/* ✅ REPLACED: Track button with TrackButton component */}
      <div className="absolute top-2 left-2">
        <TrackButton 
          product={product}
          isAlreadyTracked={isAlreadyTracked}
          onTrackSuccess={handleTrackSuccess}
          size="small"
          showLabel={true}
        />
      </div>

      {/* Product image */}
      <div className="w-36 h-36 mb-3 flex items-center justify-center">
        <img
          src={product.image || "/placeholder-image.jpg"}
          alt={product.name}
          className="w-full h-full object-contain rounded-lg"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Product name */}
      <h3 className="text-sm font-semibold text-center text-[#004d40] mb-2 line-clamp-2 flex-grow" title={product.name}>
        {product.name || "Unknown Product"}
      </h3>

      {/* Price */}
      <p className="text-green-700 font-bold text-lg mb-2">{formatPrice(product.price, product.currency)}</p>

      {/* Additional info */}
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {product.category && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.category}</span>}
        {product.isNew && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">New</span>}
      </div>

      {/* View product link */}
      {product.url && (
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto text-xs text-[#004d40] hover:underline font-medium bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors w-full text-center"
        >
          👀 View Product
        </a>
      )}

      {/* Messages */}
      {message.text && (
        <p
          className={`text-xs mt-2 text-center px-2 py-1 rounded ${
            message.type === "error"
              ? "text-red-500 bg-red-50"
              : message.type === "success"
              ? "text-green-500 bg-green-50"
              : "text-orange-500 bg-orange-50"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}