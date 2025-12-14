// src/components/SimpleReportGenerator.jsx
import { useState } from "react";
import { Download, FileText, Users, TrendingUp, Store, BarChart3 } from "lucide-react";

export default function SimpleReportGenerator() {
  const [generating, setGenerating] = useState("");
  const [error, setError] = useState("");

  // src/components/SimpleReportGenerator.jsx - UPDATE ENDPOINTS
const reportTypes = [
    {
      id: "user-activity",
      name: "User Activity Report",
      description: "List of all users with their tracking activity",
      icon: <Users className="h-5 w-5" />,
      endpoint: "/api/reports/user-activity" // Remove "admin" from path
    },
    {
      id: "price-tracking",
      name: "Price Tracking Report", 
      description: "All tracked products with price history",
      icon: <TrendingUp className="h-5 w-5" />,
      endpoint: "/api/reports/price-tracking" // Remove "admin" from path
    },
    {
      id: "store-performance",
      name: "Store Performance Report",
      description: "Store popularity and tracking metrics",
      icon: <Store className="h-5 w-5" />,
      endpoint: "/api/reports/store-performance" // Remove "admin" from path
    },
    {
      id: "system-summary",
      name: "System Summary Report",
      description: "Platform overview and key metrics",
      icon: <BarChart3 className="h-5 w-5" />,
      endpoint: "/api/reports/system-summary" // Remove "admin" from path
    }
  ];

  const generateReport = async (reportId, endpoint) => {
    try {
      setGenerating(reportId);
      setError("");
      
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get filename from headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${reportId}-report.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error("Error generating report:", err);
      setError(`Failed to generate report: ${err.message}`);
    } finally {
      setGenerating("");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        Report Generator
      </h2>
      
      <p className="text-gray-600 mb-6">
        Download CSV reports for analysis and record keeping.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600 flex-shrink-0">
                {report.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{report.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{report.description}</p>
              </div>
            </div>
            
            <button
              onClick={() => generateReport(report.id, report.endpoint)}
              disabled={generating === report.id}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {generating === report.id ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={14} />
                  Download CSV
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Reports are generated as CSV files that can be opened in Excel, Google Sheets, or any spreadsheet application.
        </p>
      </div>
    </div>
  );
}