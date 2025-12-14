// src/components/TrackButton.jsx - DEBUG VERSION (LOGS WITHOUT CLICKING)
import { useState, useEffect } from "react";
import { trackProduct } from "../api/historyApi";
import { useAuth } from "../api/AuthProvider";

export default function TrackButton({ 
  product, 
  listing, 
  isAlreadyTracked = false, 
  onTrackSuccess, 
  size = "medium", 
  showLabel = true 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tracked, setTracked] = useState(isAlreadyTracked);
  const { user, authLoading } = useAuth();
  
  // COMPREHENSIVE DEBUGGING - RUNS ON EVERY RENDER
  useEffect(() => {
    console.log("=== 🎯 TRACKBUTTON DEBUG ===");
    console.log("1. User from useAuth:", user);
    console.log("2. Auth loading:", authLoading);
    console.log("3. Has token:", !!localStorage.getItem("token"));
    console.log("4. Has user in localStorage:", !!localStorage.getItem("user"));
    
    const nestedUser = user?.user || user;
    const userId = nestedUser?.id || user?.id;
    console.log("5. Final User ID:", userId);
    
    const listingId = listing?._id || product?._id || product?.listingId;
    console.log("6. Listing ID:", listingId);
    
    const isReady = !!(listingId && userId);
    console.log("7. Is tracking ready:", isReady);
    console.log("=== 🎯 END DEBUG ===");
  }, [user, authLoading, product, listing]); // Re-run when these change

  const nestedUser = user?.user || user;
  const userId = nestedUser?.id || user?.id;

  useEffect(() => {
    setTracked(isAlreadyTracked);
  }, [isAlreadyTracked]);

  const isTrackingReady = () => {
    const listingId = listing?._id || product?._id || product?.listingId;
    return !!listingId;
  };

  const handleTrackProduct = async () => {
    console.log("🚀 TRACK BUTTON CLICKED!");
    console.log("User ID:", userId);
    
    if (!isTrackingReady()) {
      setError("Product data is not complete for tracking");
      return;
    }

    if (!userId) {
      console.log("❌ NO USER ID IN TRACKBUTTON CLICK");
      setError("Please log in to track products");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const listingId = listing?._id || product?._id || product?.listingId;
      console.log("📤 Calling API with:", { userId, listingId });

      const result = await trackProduct(userId, listingId);
      console.log("✅ Track success:", result);

      setTracked(true);

      if (onTrackSuccess) {
        onTrackSuccess({
          product: product,
          listing: listing,
          trackingId: result.trackedProduct?.Tracked_product_id || listingId
        });
      }

      const productName = result.trackedProduct?.Tracked_name || 
                         product?.name || 
                         product?.Product_Name || 
                         listing?.Listing_Product_Name || 
                         "Product";
      
      alert(`📌 ${productName} is now being tracked!`);

    } catch (err) {
      console.error("❌ Track error:", err);
      
      if (err.response?.data?.alreadyTracked) {
        setTracked(true);
        alert("This product is already being tracked!");
        return;
      }
      
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Failed to track product";
      setError(errorMessage);
      
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Also log the final render state
  const getButtonState = () => {
    if (tracked) return "tracked";
    if (loading) return "loading"; 
    if (!isTrackingReady()) return "not-ready";
    if (!userId) return "not-logged-in";
    return "ready";
  };

  const buttonState = getButtonState();
  
  // Log the final state on every render
  useEffect(() => {
    console.log("🎯 TRACKBUTTON RENDER STATE:", buttonState);
  }, [buttonState]);

  if (authLoading) {
    return (
      <button disabled className="px-3 py-1.5 text-sm bg-gray-300 text-gray-600 rounded-full font-semibold border border-gray-300 flex items-center gap-1">
        <span className="animate-spin">⏳</span>
        {showLabel && "Checking..."}
      </button>
    );
  }

  const buttonConfigs = {
    tracked: { class: "bg-green-600 text-white border-green-600", content: <>✅ {showLabel && "Tracked"}</>, disabled: true },
    loading: { class: "bg-gray-400 text-white border-gray-400", content: <>⏳ {showLabel && "Tracking..."}</>, disabled: true },
    "not-ready": { class: "bg-gray-300 text-gray-600 border-gray-300", content: <>⏳ {showLabel && "Preparing..."}</>, disabled: true },
    "not-logged-in": { class: "bg-gray-300 text-gray-600 border-gray-300", content: <>🔒 {showLabel && "Login to Track"}</>, disabled: true },
    ready: { class: "bg-[#004d40] text-white border-[#004d40] hover:bg-green-800", content: <>📌 {showLabel && "Track Price"}</>, disabled: false }
  };

  const config = buttonConfigs[buttonState];
  const sizeClasses = { small: "px-2 py-1 text-xs", medium: "px-3 py-1.5 text-sm", large: "px-4 py-2 text-base" };
  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleTrackProduct}
        disabled={config.disabled}
        className={`rounded-full font-semibold border transition-all duration-200 flex items-center gap-1 ${sizeClass} ${config.class}`}
      >
        {config.content}
      </button>
      {error && <p className="text-red-500 text-xs mt-1 text-center max-w-[200px]">{error}</p>}
    </div>
  );
}