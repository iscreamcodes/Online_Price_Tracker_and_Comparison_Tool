import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityLog } from "../components/ActivityLog";
import { UserManagement } from "../components/UserManagement";
import { SystemAlerts } from "../components/SystemAlerts";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../api/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.user.role !== "admin") return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
       
        setUsers(res.data.users);
       
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [user]);

  return (
    <div>
      <header className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Monitor system performance and manage users</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Users" value={users.length} trend="+12%" />
        <StatCard
           title="Active Trackers"
           value={
           users?.filter(u => u.User_preferences?.tracked_products?.length > 0).length ?? 0
          }
           trend="+8%"
        />


        <StatCard
            title="Stores Monitored"
            value={[...new Set(
            users.flatMap(u => u.User_preferences?.tracked_products?.map(p => p.store) || []
            )
            )].length}
             trend="+4%"
        />

        <StatCard title="System Health" value="99.8%" trend="Good" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Link to="/admin/activity" className="hover:scale-[1.02] transition-transform duration-200 block">
          <Card className="shadow-md rounded-2xl cursor-pointer">
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
              <ActivityLog recentActivities={["User logged in", "Tracker added", "Price alert sent"]} />
              <p className="text-green-600 mt-3 hover:underline">View all →</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/users" className="hover:scale-[1.02] transition-transform duration-200 block">
        <Card className="shadow-md rounded-2xl cursor-pointer">
  <CardContent className="flex flex-col items-center justify-center min-h-[237px]">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
    <p className="text-gray-500 italic text-center">
      Manage users here — click “View all” to see the full list
    </p>
    <p className="text-green-600 mt-3 hover:underline">View all →</p>
  </CardContent>
</Card>

        </Link>

        <Link to="/admin/alerts" className="hover:scale-[1.02] transition-transform duration-200 block lg:col-span-2">
          <Card className="shadow-md rounded-2xl cursor-pointer">
            <CardContent>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">System Alerts</h2>
              <SystemAlerts alerts={["API downtime resolved", "Scraper delay warning"]} />
              <p className="text-green-600 mt-3 hover:underline">View all →</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}