import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spinner, Alert } from "flowbite-react";
import { fetchDashboardStats } from "../api/dashboard";
import { StatCard } from "../components/shared/StatCard"; // ✅ Import StatCard

interface DashboardStats {
  notes: number;
  locations: number;
  tags: number;
  sessionLogs: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // ✅ Initialize navigation

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center min-h-screen">
        <Alert color="failure">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">📊 Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Notes" count={stats?.notes || 0} onClick={() => navigate("/notes")} />
        <StatCard title="Locations" count={stats?.locations || 0} onClick={() => navigate("/locations")} />
        <StatCard title="Tags" count={stats?.tags || 0} onClick={() => navigate("/tags")} />
        <StatCard title="Session Logs" count={stats?.sessionLogs || 0} onClick={() => navigate("/session_logs")} />
      </div>
    </div>
  );
}

export default Dashboard;
