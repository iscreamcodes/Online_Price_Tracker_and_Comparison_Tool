// src/pages/UserManagement.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../api/useAuth";



export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth(); // assumes admin is logged in
  const [selectedUser, setSelectedUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUserPreferences = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/preferences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreferences(res.data.preferences);
      setIsModalOpen(true);
    } catch (err) {
      console.error("❌ Error fetching user preferences:", err);
      alert("Failed to fetch user preferences");
    }
  };
  

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("❌ Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/admin/users/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(users.map((u) => (u._id === id ? res.data.user : u)));
      setEditingRoleId(null);
    } catch (err) {
      console.error("❌ Error updating role:", err);
      alert("Failed to update role.");
    }
  };

  if (loading) return <p className="text-gray-600">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Users</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Email</th>
              <th className="p-2 border text-left">Role</th>
              <th className="p-2 border text-left">Preferences</th>
              <th className="p-2 border text-left">Created At</th>
              <th className="p-2 border text-left">Updated At</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="p-2 border">{u.User_name}</td>
                <td className="p-2 border">{u.User_email}</td>

                {/* Editable Role Cell */}
                <td
                  className="p-2 border cursor-pointer text-blue-600 hover:text-blue-800"
                  onClick={() => setEditingRoleId(u._id)}
                >
                  {editingRoleId === u._id ? (
                    <select
                      autoFocus
                      defaultValue={u.role || "user"}
                      onBlur={() => setEditingRoleId(null)}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className="capitalize">{u.role || "user"}</span>
                  )}
                </td>

                {/* Preferences Display */}
                <td className="p-2 border text-gray-600">
                  {u.User_preferences?.tracked_products?.length
                    ? `${u.User_preferences.tracked_products.length} tracked products`
                    : "—"}
                </td>
                <td className="p-2 border text-center">
                <button
                    onClick={() => {
                     setSelectedUser(u);
                     fetchUserPreferences(u._id);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                >
                   View
                </button>

                </td>


                {/* Created & Updated At */}
                <td className="p-2 border text-gray-500">
                  {new Date(u.User_Created_At).toLocaleDateString()}
                </td>
               <td className="p-2 border text-gray-500">
                 {new Date(u.User_Updated_At).toLocaleDateString()}
               </td>


                {/* Delete Button */}
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
   {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h3 className="text-lg font-semibold mb-4">
        {selectedUser?.User_name || "User"}’s Preferences
      </h3>

      {preferences ? (
        <>
          <p className="text-gray-600 mb-2">
            Currency: <b>{preferences.currency}</b>
          </p>
          <p className="text-gray-600 mb-4">
            Notifications:{" "}
            <b>{preferences.notification ? "Enabled" : "Disabled"}</b>
          </p>

          <h4 className="text-md font-bold mb-2">Tracked Products:</h4>
          {preferences.tracked_products?.length > 0 ? (
            <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1 max-h-48 overflow-y-auto">
              {preferences.tracked_products.map((p, i) => (
                <li key={i}>
                  <span className="font-medium">{p.name}</span> — {p.store}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tracked products</p>
          )}
        </>
      ) : (
        <p>Loading preferences...</p>
      )}

      <button
        onClick={() => {
          setIsModalOpen(false);
          setPreferences(null);
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  </div>
)}


    </div>
  );
}
