// src/pages/SystemAlerts.jsx
export function SystemAlerts({ alerts }) {
    return (
      <ul className="text-gray-600 text-sm">
        {alerts.map((alert, i) => (
          <li key={i} className="border-b py-2">{alert}</li>
        ))}
      </ul>
    );
  }
  