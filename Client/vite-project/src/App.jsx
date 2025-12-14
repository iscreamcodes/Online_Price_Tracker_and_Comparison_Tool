import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import History from "./pages/TrackedProductsFull";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

// Admin
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import { UserManagement } from "./components/UserManagement";
import { ActivityLog } from "./components/ActivityLog";
import { SystemAlerts } from "./components/SystemAlerts";
import AdminProducts from "./pages/AdminProducts";
import Navbar from "./components/Navbar";
export default function App() {
  return (
    <ErrorBoundary>

<Navbar />
      <Routes>
        {/* Public */}
       
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="alerts" element={<SystemAlerts />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
