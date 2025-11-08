import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../api/useAuth";

export function PropUser({ users: propUsers }) {
    const [users, setUsers] = useState(propUsers || []);
    const [loading, setLoading] = useState(!propUsers); // only loading if no prop
    const [error, setError] = useState("");
    const { user } = useAuth();
  
    useEffect(() => {
      if (propUsers) return; // skip fetch if users passed
  
      const fetchUsers = async () => {
        if (!user || user.user.role !== "admin") {
          setError("Admin access required");
          setLoading(false);
          return;
        }
  
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers(res.data.users);
        } catch (err) {
          console.error("❌ Error fetching users:", err);
          setError(err.response?.data?.error || "Failed to fetch users");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, [propUsers, user]);
  
    if (loading) return <p>Loading users...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!users || users.length === 0) return <p>No users available</p>;
  
    return (
      <ul className="text-gray-700 text-sm border rounded-lg divide-y">
        {users.map((u, i) => (
          <li key={u._id || i} className="p-2 flex justify-between">
            <span>{u.User_name}</span>
            <span className="text-gray-500">{u.User_email}</span>
          </li>
        ))}
      </ul>
    );
  }
  