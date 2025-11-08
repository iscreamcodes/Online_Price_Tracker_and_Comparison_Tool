// src/pages/ActivityLog.jsx
export function ActivityLog({ recentActivities }) {
    return (
      <ul className="text-gray-600 text-sm">
        {recentActivities.map((activity, i) => (
          <li key={i} className="border-b py-2">{activity}</li>
        ))}
      </ul>
    );
  }
  