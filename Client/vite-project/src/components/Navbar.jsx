import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../api/AuthProvider";
import logo from "../assets/logo.png";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarLetter, setAvatarLetter] = useState("U");
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { user, authLoading, logout } = useAuth();

  // Update avatar letter when user changes
  useEffect(() => {
    if (!authLoading && user) {
      const nestedUser = user.user || user;
      const letter =
        (nestedUser?.User_name?.[0] || nestedUser?.name?.[0] || nestedUser?.User_email?.[0] || "U").toUpperCase();
      setAvatarLetter(letter);
    } else if (!user) {
      setAvatarLetter("U"); // reset on logout
    }
  }, [user, authLoading]);

  // Close dropdown if clicked outside
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

  // Show small spinner while auth is loading
  if (authLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 w-full bg-[#004d40] text-white shadow-md py-3 px-6 flex justify-between items-center font-poppins z-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 w-full bg-[#004d40] text-white shadow-md py-3 px-6 flex justify-between items-center font-poppins z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
      <span className="text-2xl font-bold">TrackIt</span>
        <img src={logo} alt="Company Logo" className="h-12 w-auto" />
       
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 ml-auto">
        <button onClick={() => navigate("/")} className="hover:text-green-200 transition px-2 py-1">
          Home
        </button>
        <button onClick={() => navigate("/about")} className="hover:text-green-200 transition px-2 py-1">
          About
        </button>
        <button onClick={() => navigate("/services")} className="hover:text-green-200 transition px-2 py-1">
          Services
        </button>
        <button onClick={() => navigate("/contact")} className="hover:text-green-200 transition px-2 py-1">
          Contact
        </button>
        
       
       
      </div>

      {/* Auth Section */}
      {!user ? (
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium border border-white rounded-lg hover:bg-white hover:text-[#004d40] transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium bg-white text-[#004d40] rounded-lg hover:bg-green-100 transition"
          >
            Sign Up
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          {/* Avatar circle only */}
          <div
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center cursor-pointer hover:bg-green-700 p-2 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-full bg-white text-[#004d40] flex items-center justify-center font-semibold">
              {avatarLetter}
            </div>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 text-[#004d40]">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-semibold">{user.user?.User_name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user.user?.User_email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/dashboard");
                }}
                className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2"
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2"
              >
                👤 My Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center gap-2"
              >
                ⚙️ Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
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