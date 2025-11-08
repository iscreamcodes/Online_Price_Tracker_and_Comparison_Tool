import { Navigate } from "react-router-dom";

import { useEffect } from "react";


// Create this small component (anywhere in the same file or a new one)
export function DevLogout() {
  useEffect(() => {
    localStorage.removeItem("token");
  }, []);

  // Navigate once after clearing token
  return <Navigate to="/" replace />;
}
