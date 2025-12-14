// src/pages/Register.jsx
import { useState } from "react";
import { registerUser } from "../api/authApi";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    User_name: "",
    User_email: "",
    User_password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.User_name.trim()) {
      newErrors.User_name = "Name is required";
    } else if (formData.User_name.length < 2) {
      newErrors.User_name = "Name must be at least 2 characters";
    }

    if (!formData.User_email) {
      newErrors.User_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.User_email)) {
      newErrors.User_email = "Email is invalid";
    }

    if (!formData.User_password) {
      newErrors.User_password = "Password is required";
    } else if (formData.User_password.length < 6) {
      newErrors.User_password = "Password must be at least 6 characters";
    }

    if (formData.User_password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = await registerUser({
        User_name: formData.User_name.trim(),
        User_email: formData.User_email.toLowerCase().trim(),
        User_password: formData.User_password,
      });

      setMessage(
        data.message || "🎉 Registration successful! Redirecting to login..."
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setFormData({
      User_name: "Demo User",
      User_email: "demo@example.com",
      User_password: "demo123",
      confirmPassword: "demo123",
    });
    setErrors({});
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Price Tracker</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">
            Create Your Account
          </h2>
          <p className="text-gray-600 mt-1">
            Start tracking prices and save money today
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleRegister}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
        >
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-center text-sm ${
                message.includes("successful")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Input */}
          {[
            { id: "User_name", label: "Full Name", type: "text" },
            { id: "User_email", label: "Email Address", type: "email" },
            { id: "User_password", label: "Password", type: "password" },
            {
              id: "confirmPassword",
              label: "Confirm Password",
              type: "password",
            },
          ].map((field) => (
            <div className="mb-4" key={field.id}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {field.label}
              </label>

              <input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.label}
                value={formData[field.id]}
                onChange={handleChange}
                disabled={loading}
                className={`
                  w-full px-4 py-3 rounded-lg 
                  bg-gray-100 text-gray-800 
                  border 
                  focus:ring-2 focus:ring-green-500 focus:border-transparent
                  placeholder-gray-500
                  ${
                    errors[field.id]
                      ? "border-red-400"
                      : "border-gray-300"
                  }
                `}
              />

              {errors[field.id] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Demo Fill */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Fill demo account details
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link className="text-green-600 font-semibold" to="/login">
              Sign in here
            </Link>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="text-green-600 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-green-600 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
