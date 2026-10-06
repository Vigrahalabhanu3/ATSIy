import { apiFetch } from "./client";

export async function fetchReports(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.search) query.set("search", params.search);

  const res = await apiFetch(`/api/reports?${query.toString()}`);
  return res.json();
}

export async function fetchReportById(id: string) {
  const res = await apiFetch(`/api/reports/${id}`);
  return res.json();
}

export async function deleteReportById(id: string) {
  const res = await apiFetch(`/api/reports/${id}`, {
    method: "DELETE",
  });
  return res.json();
}

export function getReportDownloadUrl(id: string) {
  return `/api/reports/${id}/download`;
}
