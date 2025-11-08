// src/pages/StatCard.jsx
export function StatCard({ title, value, trend }) {
    const trendColor = trend.includes("+")
      ? "text-green-600"
      : trend === "Good" || trend === "Stable"
      ? "text-blue-600"
      : "text-red-600";
  
    return (
      <div className="bg-white shadow-sm rounded-2xl p-5 hover:shadow-md transition duration-200">
        <h3 className="text-gray-500 text-sm mb-2">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        <span className={`text-sm font-medium ${trendColor}`}>{trend}</span>
      </div>
    );
  }
  