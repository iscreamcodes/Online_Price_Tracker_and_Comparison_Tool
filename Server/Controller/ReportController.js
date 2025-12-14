// Controller/ReportController.js - UPDATED WITH ALL IMPORTS
import Users from "../Model/Users.js";
import Products from "../Model/Products.js";
import Listings from "../Model/Listings.js";

// Import the required packages
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
// For Excel export (optional)
// import * as XLSX from 'xlsx';

/* ============================================================
   SIMPLE USER ACTIVITY REPORT (CSV ONLY - No PDF for now)
============================================================ */
export const generateUserActivityReport = async (req, res) => {
  try {
    console.log("📊 Generating user activity report...");
    
    const users = await Users.find({}, "-User_password")
      .sort({ User_createdAt: -1 });

    const reportData = users.map(user => ({
      userId: user._id.toString(),
      userName: user.User_name || 'N/A',
      email: user.User_email || 'N/A',
      role: user.User_role || 'user',
      joinedDate: user.User_createdAt ? new Date(user.User_createdAt).toLocaleDateString() : 'N/A',
      trackedProductsCount: user.User_preferences?.User_tracked_products?.length || 0,
      lastActive: user.User_lastActive ? new Date(user.User_lastActive).toLocaleDateString() : 'Never',
      status: 'Active'
    }));

    // Generate CSV
    const fields = [
      'userId', 'userName', 'email', 'role', 'joinedDate', 
      'trackedProductsCount', 'lastActive', 'status'
    ];
    
    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(reportData);
    
    const filename = `user-activity-report-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log("✅ User activity report generated successfully");

  } catch (err) {
    console.error("❌ Error generating user activity report:", err);
    res.status(500).json({ 
      error: "Failed to generate user activity report",
      message: err.message 
    });
  }
};

/* ============================================================
   SIMPLE PRICE TRACKING REPORT (CSV ONLY)
============================================================ */
export const generatePriceTrackingReport = async (req, res) => {
  try {
    console.log("📊 Generating price tracking report...");
    
    const users = await Users.find({}, "User_preferences.User_tracked_products User_name User_email");

    const trackingData = [];
    
    users.forEach(user => {
      user.User_preferences?.User_tracked_products?.forEach(product => {
        const currentPrice = product.Tracked_price_history?.[0]?.History_price;
        const currency = product.Tracked_currency || 'KES';
        
        trackingData.push({
          userName: user.User_name || 'Unknown User',
          userEmail: user.User_email || 'N/A',
          productName: product.Tracked_name || 'Unknown Product',
          store: product.Tracked_store || 'Unknown Store',
          currentPrice: currentPrice ? `${currency} ${currentPrice}` : 'N/A',
          priceChanges: product.Tracked_price_history?.length || 0,
          trackingSince: product.Tracked_since ? new Date(product.Tracked_since).toLocaleDateString() : 'N/A',
          lastUpdated: product.Tracked_price_history?.[0]?.History_date ? 
            new Date(product.Tracked_price_history[0].History_date).toLocaleDateString() : 'Never',
          productUrl: product.Tracked_url || 'N/A'
        });
      });
    });

    // Generate CSV
    const fields = [
      'userName', 'userEmail', 'productName', 'store', 
      'currentPrice', 'priceChanges', 'trackingSince', 'lastUpdated', 'productUrl'
    ];
    
    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(trackingData);
    
    const filename = `price-tracking-report-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log("✅ Price tracking report generated successfully");

  } catch (err) {
    console.error("❌ Error generating price tracking report:", err);
    res.status(500).json({ 
      error: "Failed to generate price tracking report",
      message: err.message 
    });
  }
};

/* ============================================================
   SIMPLE STORE PERFORMANCE REPORT (CSV ONLY)
============================================================ */
export const generateStorePerformanceReport = async (req, res) => {
  try {
    console.log("📊 Generating store performance report...");
    
    const users = await Users.find({}, "User_preferences.User_tracked_products");
    
    const storeStats = {};
    
    users.forEach(user => {
      user.User_preferences?.User_tracked_products?.forEach(product => {
        const store = product.Tracked_store;
        if (store) {
          if (!storeStats[store]) {
            storeStats[store] = {
              storeName: store,
              totalProductsTracked: 0,
              totalUsersTracking: new Set(),
              totalPriceChanges: 0
            };
          }
          
          storeStats[store].totalProductsTracked++;
          storeStats[store].totalUsersTracking.add(user._id.toString());
          storeStats[store].totalPriceChanges += product.Tracked_price_history?.length || 0;
        }
      });
    });

    const reportData = Object.values(storeStats).map(store => ({
      storeName: store.storeName,
      totalProductsTracked: store.totalProductsTracked,
      totalUsersTracking: store.totalUsersTracking.size,
      totalPriceChanges: store.totalPriceChanges,
      averagePriceChangesPerProduct: store.totalProductsTracked > 0 ? 
        (store.totalPriceChanges / store.totalProductsTracked).toFixed(1) : '0'
    }));

    // Generate CSV
    const fields = [
      'storeName', 'totalProductsTracked', 'totalUsersTracking',
      'totalPriceChanges', 'averagePriceChangesPerProduct'
    ];
    
    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(reportData);
    
    const filename = `store-performance-report-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log("✅ Store performance report generated successfully");

  } catch (err) {
    console.error("❌ Error generating store performance report:", err);
    res.status(500).json({ 
      error: "Failed to generate store performance report",
      message: err.message 
    });
  }
};

/* ============================================================
   SYSTEM SUMMARY REPORT (Simple JSON/CSV)
============================================================ */
export const generateSystemSummaryReport = async (req, res) => {
  try {
    console.log("📊 Generating system summary report...");
    
    const [totalUsers, totalProducts, totalListings, activeUsers] = await Promise.all([
      Users.countDocuments(),
      Products.countDocuments(),
      Listings.countDocuments(),
      Users.countDocuments({ "User_preferences.User_tracked_products.0": { $exists: true } })
    ]);

    // Get store count
    const users = await Users.find({}, "User_preferences.User_tracked_products.Tracked_store");
    const uniqueStores = new Set();
    users.forEach(user => {
      user.User_preferences?.User_tracked_products?.forEach(product => {
        if (product.Tracked_store) uniqueStores.add(product.Tracked_store);
      });
    });

    const summaryData = [{
      metric: 'Total Users',
      value: totalUsers,
      description: 'Registered users on the platform'
    }, {
      metric: 'Active Users',
      value: activeUsers,
      description: 'Users tracking at least one product'
    }, {
      metric: 'Total Products',
      value: totalProducts,
      description: 'Products in the database'
    }, {
      metric: 'Total Listings',
      value: totalListings,
      description: 'Product listings from stores'
    }, {
      metric: 'Stores Monitored',
      value: uniqueStores.size,
      description: 'Unique stores being tracked'
    }, {
      metric: 'Report Generated',
      value: new Date().toLocaleDateString(),
      description: 'Date of report generation'
    }];

    // Generate CSV
    const fields = ['metric', 'value', 'description'];
    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(summaryData);
    
    const filename = `system-summary-report-${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    console.log("✅ System summary report generated successfully");

  } catch (err) {
    console.error("❌ Error generating system summary report:", err);
    res.status(500).json({ 
      error: "Failed to generate system summary report",
      message: err.message 
    });
  }
};