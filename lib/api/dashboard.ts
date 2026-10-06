import { apiFetch } from "./client";

export async function fetchDashboardStats() {
  const res = await apiFetch("/api/dashboard/stats");
  return res.json();
}

export async function fetchRecentDashboardAnalyses() {
  const res = await apiFetch("/api/dashboard/recent");
  return res.json();
}
