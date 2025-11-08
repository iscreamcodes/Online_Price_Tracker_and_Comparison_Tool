import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./api/AuthProvider";

// Admin
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import { UserManagement } from "./components/UserManagement";
import { ActivityLog } from "./components/ActivityLog";
import { SystemAlerts } from "./components/SystemAlerts";

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />

            {/* ✅ Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="activity" element={<ActivityLog />} />
              <Route path="alerts" element={<SystemAlerts />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}
