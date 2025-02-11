import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { Loader } from "../components/shared/Loader";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { StatCard } from "../components/shared/StatCard";
import { DashboardStats } from "../types/DashboardStats"; // ✅ Import shared type

export function Dashboard() {
  const { stats, loading, error } = useDashboardStats();
  const navigate = useNavigate(); // ✅ Initialize navigation

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

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
