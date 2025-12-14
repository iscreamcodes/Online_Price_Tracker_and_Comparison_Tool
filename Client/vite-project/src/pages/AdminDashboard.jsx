// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { SystemAlerts } from "../components/SystemAlerts";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../api/AuthProvider";
import SimpleReportGenerator from "../components/SimpleReportGenerator";
import { 
  Users, 
  ShoppingBag, 
  BarChart3, 
  Store, 
  TrendingUp, 
  Package,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function AdminDashboard() {
  const { user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = user?.user || user;

  // Fetch comprehensive dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch("http://localhost:5000/api/admin/dashboard-stats", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      console.log("📊 Dashboard stats received:", data);
      setStats(data);
      
    } catch (err) {
      console.error("❌ Error fetching dashboard stats:", err);
      setError(err.message || "Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardStats();
    } catch (err) {
      console.error("❌ Error refreshing stats:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Auth & Role Check
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        console.log("No user found, redirecting to login");
        navigate("/login");
        return;
      }

      if (currentUser.role !== "admin") {
        console.log("User is not admin, redirecting to profile");
        navigate("/profile");
        return;
      }

      // Admin verified, fetch dashboard data
      fetchDashboardStats();
    }
  }, [currentUser, authLoading, navigate]);

  // Format uptime
  const formatUptime = (seconds) => {
    if (!seconds) return "0m";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Format memory usage
  const formatMemory = (bytes) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Loading Screens
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{authLoading ? "Checking authentication..." : "Loading dashboard data..."}</p>
        </div>
      </div>
    );
  }

  // Final role check
  if (currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need administrator privileges to access this page.</p>
          <Link
            to="/profile"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-red-200 max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {currentUser.User_name || currentUser.name}! Comprehensive overview of your platform.
              </p>
            </div>
            
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users Card */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Users</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.users?.total?.toLocaleString() || 0}
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span>{stats.users?.newThisWeek || 0} new this week</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.users?.activeTrackers || 0} active trackers ({stats.users?.percentageActive || 0}%)
              </div>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Products</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.products?.total?.toLocaleString() || 0}
              </h3>
              <div className="text-sm text-gray-600">
                {stats.products?.totalListings?.toLocaleString() || 0} listings
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.products?.activeListings || 0} active • {stats.products?.newListingsThisWeek || 0} new this week
              </div>
            </CardContent>
          </Card>

          {/* Tracking Card */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Tracking</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.tracking?.totalTrackedItems?.toLocaleString() || 0}
              </h3>
              <div className="text-sm text-gray-600">
                {stats.tracking?.averagePerUser || 0} per user
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.tracking?.totalPriceChanges || 0} price changes • {stats.tracking?.productsWithPriceDrops || 0} price drops
              </div>
            </CardContent>
          </Card>

          {/* Stores Card */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Store className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Stores</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.stores?.uniqueStoresTracked || 0}
              </h3>
              <div className="text-sm text-gray-600">
                Stores monitored
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Top: {stats.stores?.mostPopularStores?.[0]?.store || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Popular Stores */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-orange-600" />
                Most Popular Stores
              </h3>
              <div className="space-y-3">
                {stats.stores?.mostPopularStores?.map((store, index) => (
                  <div key={store.store} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{store.store}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {store.count} trackers
                    </span>
                  </div>
                ))}
                {(!stats.stores?.mostPopularStores || stats.stores.mostPopularStores.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No store data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-gray-900">{formatUptime(stats.system?.uptime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium text-gray-900">{formatMemory(stats.system?.memoryUsage?.heapUsed)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium text-gray-900">
                    {stats.system?.timestamp ? new Date(stats.system.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="flex items-center text-green-600 font-medium">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Operational
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <CardContent className="p-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/admin/users" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-center block"
              >
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <span className="font-medium text-gray-900">Manage Users</span>
              </Link>
              <Link 
                to="/admin/products" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-center block"
              >
                <ShoppingBag className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <span className="font-medium text-gray-900">Manage Products</span>
              </Link>
              <Link 
                to="/admin/listings" 
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-center block"
              >
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <span className="font-medium text-gray-900">View Listings</span>
              </Link>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8">
  <SimpleReportGenerator />
</div>
      </div>
    </div>
  );
}