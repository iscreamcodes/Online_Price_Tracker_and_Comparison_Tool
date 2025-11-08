import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/70 via-green-100/60 to-white text-gray-700 p-8">
      {/* Navigation */}
      
      {/* Render nested routes here */}
      <Outlet />
    </div>
  );
}
