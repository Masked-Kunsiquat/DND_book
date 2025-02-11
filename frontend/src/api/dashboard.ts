import { pb } from "./base";

interface DashboardStats {
  notes: number;
  locations: number;
  tags: number;
  sessionLogs: number;
}

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
    console.error("❌ Failed to fetch dashboard stats:", error);
    return { notes: 0, locations: 0, tags: 0, sessionLogs: 0 };
  }
}
