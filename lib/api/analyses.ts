import { apiFetch } from "./client";

export async function createAnalysis(data: {
  resumeId: string;
  jobDescription: string;
}) {
  const res = await apiFetch("/api/analyses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAnalyses(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.search) query.set("search", params.search);

  const res = await apiFetch(`/api/analyses?${query.toString()}`);
  return res.json();
}

export async function fetchAnalysisById(id: string) {
  const res = await apiFetch(`/api/analyses/${id}`);
  return res.json();
}

export async function deleteAnalysisById(id: string) {
  const res = await apiFetch(`/api/analyses/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
