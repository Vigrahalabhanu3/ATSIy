import { apiFetch } from "./client";

export async function uploadResumeFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch("/api/resumes", {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchResumes(params?: { page?: number; limit?: number; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.search) query.set("search", params.search);

  const res = await apiFetch(`/api/resumes?${query.toString()}`);
  return res.json();
}

export async function fetchResumeById(id: string) {
  const res = await apiFetch(`/api/resumes/${id}`);
  return res.json();
}

export async function deleteResumeById(id: string) {
  const res = await apiFetch(`/api/resumes/${id}`, {
    method: "DELETE",
  });
  return res.json();
}
