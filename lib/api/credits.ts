import { CreditBalanceResponse, CreditHistoryResponse } from "@/types/credits";
import { PlanConfigMap } from "@/lib/config/plans";

export async function getCredits(): Promise<CreditBalanceResponse> {
  const res = await fetch("/api/credits", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to load credits");
  }

  const json = await res.json();
  return json.data || json;
}

export async function getCreditHistory(page: number = 1, limit: number = 20): Promise<CreditHistoryResponse> {
  const res = await fetch(`/api/credits/history?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to load credit history");
  }

  const json = await res.json();
  return json.data || json;
}

export async function getPlans(): Promise<{ plans: PlanConfigMap }> {
  const res = await fetch("/api/credits/plans", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to load plans");
  }

  const json = await res.json();
  return json.data || json;
}
