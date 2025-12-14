// src/pages/AdminProducts.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../api/AuthProvider";
import { ExternalLink, Trash2, ChevronDown, ChevronRight, Store, Users, Tag, Star } from "lucide-react";

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [filterStore, setFilterStore] = useState("all");
  const [filterTracked, setFilterTracked] = useState("all");
  const [stats, setStats] = useState(null);

  const token = localStorage.getItem("token");
  const currentUser = user?.user || user;

  // Fetch products with ALL their listings
  const fetchProductsWithAllListings = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await axios.get(
        "http://localhost:5000/api/admin/products-with-all-listings",
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("✅ Products with ALL listings:", response.data);
      setProducts(response.data.products || []);
      setStats(response.data.stats);
      
    } catch (err) {
      console.error("❌ Error fetching products:", err);
      setError(err.response?.data?.error || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Delete a product permanently
  const handleDeleteProduct = async (productId, productName, totalListings, totalTracked) => {
    if (!window.confirm(
      `🚨 PERMANENTLY Delete Product: ${productName}?\n\n⚠️  THIS ACTION CANNOT BE UNDONE!\n\nThis will permanently delete:\n• The product itself\n• All ${totalListings} associated listings\n• Remove from ${totalTracked} users' tracked products`
    )) return;

    // Extra safety check
    const userInput = prompt('Please type "DELETE" to confirm permanent deletion:');
    if (userInput !== "DELETE") {
      alert("Deletion cancelled. The product was NOT deleted.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/products/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ ${response.data.message}\n\nDeleted:\n• ${response.data.stats.listingsDeleted} listings\n• Removed from ${response.data.stats.usersAffected} users`);
      fetchProductsWithAllListings();

    } catch (err) {
      console.error("❌ Error deleting product:", err);
      const errorMsg = err.response?.data?.error || "Failed to delete product";
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  // Delete a single listing
  const handleDeleteListing = async (listingId, productName, store) => {
    if (!window.confirm(
      `🗑️ Delete listing for "${productName}" from ${store}?\n\nThis will permanently remove this listing from the system.`
    )) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/listings/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ ${response.data.message}`);
      fetchProductsWithAllListings();

    } catch (err) {
      console.error("❌ Error deleting listing:", err);
      const errorMsg = err.response?.data?.error || "Failed to delete listing";
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  // Untrack a listing (remove from user's tracked products)
  const handleUntrackListing = async (listingId, productName, store) => {
    if (!window.confirm(
      `⭐ Remove "${productName}" from ${store} from tracked products?\n\nThis will only remove it from user tracking, not delete the listing.`
    )) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/admin/tracked-products/${listingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ ${response.data.message}`);
      fetchProductsWithAllListings();

    } catch (err) {
      console.error("❌ Error untracking listing:", err);
      const errorMsg = err.response?.data?.error || "Failed to untrack listing";
      alert(`❌ Error: ${errorMsg}`);
    }
  };

  // Toggle product expansion
  const toggleProduct = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchProductsWithAllListings();
    }
  }, [currentUser]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.Product_Name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === "all" || 
      product.allListings?.some(listing => listing.store === filterStore);
    
    const matchesTracked = filterTracked === "all" || 
      (filterTracked === "tracked" && product.isTracked) ||
      (filterTracked === "not_tracked" && !product.isTracked);

    return matchesSearch && matchesStore && matchesTracked;
  });

  // Get unique stores from ALL listings
  const allStores = [...new Set(
    products.flatMap(product => 
      product.allListings?.map(listing => listing.store) || []
    )
  )].filter(Boolean).sort();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        <button onClick={fetchProductsWithAllListings} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Products & Listings Management</h1>
          <p className="text-gray-600 mt-2">
            Manage products, listings, and user tracking
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Store className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Products with Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.productsWithListings}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Tracked Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrackedListings}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-lg mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded-lg w-full"
            />
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="px-3 py-2 border rounded-lg w-full"
            >
              <option value="all">All Stores</option>
              {allStores.map((store) => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
            <select
              value={filterTracked}
              onChange={(e) => setFilterTracked(e.target.value)}
              className="px-3 py-2 border rounded-lg w-full"
            >
              <option value="all">All Products</option>
              <option value="tracked">Tracked Only</option>
              <option value="not_tracked">Not Tracked</option>
            </select>
            <div className="text-gray-600 flex items-center">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No products found matching your criteria
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <div key={product._id} className="hover:bg-gray-50">
                  {/* Product Row */}
                  <div 
                    className="px-6 py-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleProduct(product._id)}
                  >
                    <div className="flex items-center space-x-4">
                      {expandedProduct === product._id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 flex items-center">
                          {product.Product_Name}
                          {product.isTracked && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Tracked
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.totalListings} listings • 
                          {product.totalTracked > 0 && (
                            <span className="ml-1 text-yellow-600">
                              {product.totalTracked} tracked
                            </span>
                          )}
                          {product.Product_code && (
                            <span className="ml-2">• Code: {product.Product_code}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.totalListings} listings
                      </span>
                      {product.totalTracked > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {product.totalTracked} tracked
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(
                            product._id, 
                            product.Product_Name, 
                            product.totalListings, 
                            product.totalTracked
                          );
                        }}
                        className="text-red-600 hover:text-red-900 p-1 ml-2"
                        title="Permanently delete product and all listings"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Listings Dropdown */}
                  {expandedProduct === product._id && (
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        All Listings for this Product ({product.allListings?.length || 0}):
                      </h4>
                      
                      {!product.allListings || product.allListings.length === 0 ? (
                        <p className="text-gray-500 text-sm">No listings found</p>
                      ) : (
                        <div className="space-y-3">
                          {product.allListings.map((listing, index) => (
                            <div 
                              key={listing._id || index} 
                              className={`p-4 rounded-lg border ${
                                listing.isTracked 
                                  ? 'bg-yellow-50 border-yellow-200' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <Store className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{listing.store}</span>
                                    <span className="text-sm text-gray-500">•</span>
                                    <span className="text-sm font-semibold text-gray-700">
                                      {listing.currency} {listing.price}
                                    </span>
                                    {listing.isTracked && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <Star className="h-3 w-3 mr-1" />
                                        Tracked
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    {listing.url && (
                                      <a 
                                        href={listing.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        View Listing
                                      </a>
                                    )}
                                    <span>Code: {listing.listingCode}</span>
                                    <span>Updated: {new Date(listing.lastUpdated).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  {listing.isTracked && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUntrackListing(listing.listingId, product.Product_Name, listing.store);
                                      }}
                                      className="text-orange-600 hover:text-orange-900 p-1"
                                      title="Untrack this listing"
                                    >
                                      <Star className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteListing(listing.listingId, product.Product_Name, listing.store);
                                    }}
                                    className="text-red-600 hover:text-red-900 p-1"
                                    title="Delete this listing"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}