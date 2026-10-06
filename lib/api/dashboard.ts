export async function fetchDashboardStats() {
  const res = await fetch("/api/dashboard/stats");
  return res.json();
}

export async function fetchRecentDashboardAnalyses() {
  const res = await fetch("/api/dashboard/recent");
  return res.json();
}
