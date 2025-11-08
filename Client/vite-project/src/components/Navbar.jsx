import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../api/useAuth";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="w-full bg-[#004d40] text-white shadow-md py-3 px-6 flex justify-between items-center relative font-poppins">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
        <img src={logo} alt="Company Logo" className="h-12 w-auto" />
      </div>

      {/* Navigation Links - ONLY HOME */}
      <div className="flex space-x-6">
        <button
          onClick={() => navigate("/")}
          className="hover:text-green-200 transition"
        >
          Home
        </button>
      </div>

      {/* Auth Section */}
      {!user ? (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium border border-white rounded-lg hover:bg-white hover:text-[#004d40] transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-sm font-medium bg-white text-[#004d40] rounded-lg hover:bg-green-100 transition"
          >
            Sign Up
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer hover:bg-green-700 px-3 py-2 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-full bg-white text-[#004d40] flex items-center justify-center font-semibold">
              {user.user?.User_name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="font-medium">{user.user?.User_name}</span>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 text-[#004d40]">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold">{user.user?.User_name}</p>
                <p className="text-xs text-gray-500">{user.user?.User_email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2"
              >
                👤 My Profile
              </button>
              {/* REMOVED: Tracked Products and Price History from dropdown */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}