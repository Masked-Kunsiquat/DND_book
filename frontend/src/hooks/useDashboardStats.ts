import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../api/dashboard";
import type { DashboardStats } from "../types/DashboardStats";

/**
 * Custom hook to fetch dashboard statistics.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController(); // ✅ Setup cleanup mechanism
    const signal = controller.signal;

    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchDashboardStats();

        if (!signal.aborted) {
          setStats(data);
        }
      } catch (err: any) {
        if (signal.aborted) return; // ✅ Prevent setting state after unmount

        if (err.name === "AbortError") {
          console.log("Dashboard stats fetch aborted");
        } else if (err.message.includes("NetworkError")) {
          setError("Network error: Unable to fetch dashboard stats.");
        } else {
          setError("Failed to load dashboard statistics. Please try again.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => controller.abort(); // ✅ Cleanup on component unmount
  }, []);

  return { stats, loading, error };
}
