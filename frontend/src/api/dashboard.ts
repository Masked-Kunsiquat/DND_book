import { pb } from "./base";
import { DashboardStats } from "../types/DashboardStats";

/**
 * Fetch total counts for dashboard statistics.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [notes, locations, tags, sessionLogs] = await Promise.all([
      pb.collection("notes").getList(1, 1, { requestKey: null }), // Prevents auto-cancel
      pb.collection("locations").getList(1, 1, { requestKey: null }),
      pb.collection("tags").getList(1, 1, { requestKey: null }),
      pb.collection("session_logs").getList(1, 1, { requestKey: null }),
    ]);

    return {
      notes: notes.totalItems,
      locations: locations.totalItems,
      tags: tags.totalItems,
      sessionLogs: sessionLogs.totalItems,
    };
  } catch (error: any) {
    console.error("❌ Failed to fetch dashboard stats:", error.message);
    throw new Error("Failed to fetch dashboard statistics. Please try again.");
  }
}
