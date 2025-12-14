// src/pages/UserManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../api/AuthProvider";

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  // Flatten user object
  const currentUser = user?.user || user;

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setError(err.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user preferences
  const fetchUserPreferences = async (userId) => {
    try {
      setActionLoading(`preferences-${userId}`);
      const res = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/preferences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreferences(res.data.preferences);
      setIsModalOpen(true);
    } catch (err) {
      console.error("❌ Error fetching user preferences:", err);
      setError(err.response?.data?.error || "Failed to fetch user preferences");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user
  const handleDelete = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) return;
    
    try {
      setActionLoading(`delete-${id}`);
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      setError(err.response?.data?.error || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  // Update user role
  const handleRoleChange = async (id, newRole) => {
    try {
      setActionLoading(`role-${id}`);
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((u) => (u._id === id ? res.data.user : u)));
      setEditingRoleId(null);
    } catch (err) {
      console.error("❌ Error updating role:", err);
      setError(err.response?.data?.error || "Failed to update user role");
    } finally {
      setActionLoading(null);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setPreferences(null);
    setSelectedUser(null);
  };

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  // Enhanced category detection for products
  const determineCategory = (productName) => {
    if (!productName) return 'Electronics';
    const name = productName.toLowerCase();
    
    // Prioritize headphone detection
    if (name.includes('headphone') || name.includes('earbud') || name.includes('earphone') || name.includes('headset')) {
      return 'Audio';
    }
    if (name.includes('phone') || name.includes('mobile') || name.includes('smartphone')) return 'Phones';
    if (name.includes('laptop') || name.includes('computer') || name.includes('notebook')) return 'Computers';
    if (name.includes('tv') || name.includes('television') || name.includes('monitor') || name.includes('screen')) return 'Electronics';
    if (name.includes('fridge') || name.includes('washing') || name.includes('cooker') || name.includes('home')) return 'Home Appliances';
    if (name.includes('shirt') || name.includes('dress') || name.includes('shoe') || name.includes('fashion')) return 'Fashion';
    return 'Electronics';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Deny access if not admin
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need administrator privileges to access this page.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.User_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.User_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.User_role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <p className="text-gray-600 mt-1">Manage users and their permissions across the platform</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Total: <span className="font-semibold text-gray-700">{users.length}</span> users
                </div>
                <button
                  onClick={fetchUsers}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Loading users...</span>
              </div>
            </div>
          )}

          {/* Users Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracked Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {user.User_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.User_name || 'Unnamed User'}</div>
                            <div className="text-sm text-gray-500">{user.User_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingRoleId === user._id ? (
                          <select
                            autoFocus
                            defaultValue={user.User_role || "user"}
                            onBlur={() => setEditingRoleId(null)}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            disabled={actionLoading === `role-${user._id}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        ) : (
                          <div 
                            className="flex items-center cursor-pointer group"
                            onClick={() => setEditingRoleId(user._id)}
                          >
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              user.User_role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                : user.User_role === 'moderator'
                                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {user.User_role || "user"}
                            </span>
                            <span className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">Edit</span>
                          </div>
                        )}
                        {actionLoading === `role-${user._id}` && (
                          <div className="mt-1">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </td>

                      {/* Tracked Products */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            fetchUserPreferences(user._id);
                          }}
                          disabled={actionLoading === `preferences-${user._id}`}
                          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                            {user.User_preferences?.User_tracked_products?.length || 0}
                          </span>
                          <span className="ml-2 text-sm">
                            {actionLoading === `preferences-${user._id}` ? 'Loading...' : 'View Details'}
                          </span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.User_createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleDelete(user._id, user.User_name)}
                            disabled={actionLoading === `delete-${user._id}`}
                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            title="Delete User"
                          >
                            {actionLoading === `delete-${user._id}` ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                🗑️ Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">👥</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {searchTerm ? 'No users match your search criteria. Try adjusting your search terms.' : 'No users have been registered yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Preferences Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedUser.User_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    {selectedUser.User_name}'s Dashboard
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{selectedUser.User_email}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Tracked Products Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 p-1 rounded">📦</span>
                    Tracked Products
                  </h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {preferences?.User_tracked_products?.length || 0} items
                  </span>
                </div>
                
                {preferences?.User_tracked_products?.length > 0 ? (
                  <div className="grid gap-3">
{preferences?.User_tracked_products?.length > 0 ? (
  <div className="grid gap-3">
    {preferences.User_tracked_products.map((product, index) => (
      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Product Name */}
            <div className="font-medium text-gray-800 mb-2 line-clamp-2">
              {product.Tracked_name || 'Unnamed Product'}
            </div>
            
            {/* Product Details */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
              {/* Store */}
              {product.Tracked_store && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  🏪 {product.Tracked_store}
                </span>
              )}
              
              {/* Current Price */}
              {product.Tracked_price_history?.length > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  💰 {product.Tracked_currency || 'KES'} {Math.round(product.Tracked_price_history[0]?.price || 0).toLocaleString()}
                </span>
              )}
              
              {/* Category */}
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs capitalize">
                📦 {determineCategory(product.Tracked_name)}
              </span>
            </div>
            
            {/* Price History Summary */}
            {product.Tracked_price_history?.length > 1 && (
              <div className="text-xs text-gray-500 mt-1">
                📊 {product.Tracked_price_history.length} price updates
                {product.Tracked_price_history[0]?.date && (
                  <span className="ml-2">
                    Latest: {formatDate(product.Tracked_price_history[0].date)}
                  </span>
                )}
              </div>
            )}
            
            {/* Tracking Duration */}
            {product.Tracked_since && (
              <div className="text-xs text-gray-500 mt-1">
                ⏰ Tracking since: {formatDate(product.Tracked_since)}
              </div>
            )}
            
            {/* Product URL */}
            {product.Tracked_url && (
              <div className="mt-2">
                <a 
                  href={product.Tracked_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                >
                  🔗 View Product Listing
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
      <span className="text-2xl text-gray-400">📭</span>
    </div>
    <p className="text-gray-500">No products being tracked</p>
    <p className="text-gray-400 text-sm mt-1">This user hasn't started tracking any products yet.</p>
  </div>
)}

                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl text-gray-400">📭</span>
                    </div>
                    <p className="text-gray-500">No products being tracked</p>
                    <p className="text-gray-400 text-sm mt-1">This user hasn't started tracking any products yet.</p>
                  </div>
                )}
              </div>

            {/* User Statistics */}
<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
  <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
    <span className="bg-blue-100 text-blue-800 p-1 rounded">📊</span>
    User Statistics
  </h4>
  <div className="grid grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-2xl font-bold text-blue-600">
        {preferences?.User_tracked_products?.length || 0}
      </div>
      <div className="text-sm text-gray-600">Tracked Items</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-purple-600 capitalize">
        {selectedUser.User_role || 'user'}
      </div>
      <div className="text-sm text-gray-600">Role</div>
    </div>
    <div className="text-center">
      <div className="text-2xl font-bold text-green-600">
        {new Set(preferences?.User_tracked_products?.map(p => p.Tracked_store) || []).size}
      </div>
      <div className="text-sm text-gray-600">Stores</div>
    </div>
  </div>
</div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}