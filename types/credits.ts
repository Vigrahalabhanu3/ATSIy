import { PlanType } from "@/lib/config/plans";

export type CreditTransactionType =
  | "ALLOCATED"
  | "RESERVED"
  | "CONSUMED"
  | "REFUNDED"
  | "EXPIRED"
  | "ADJUSTED"
  | "PLAN_UPGRADE";

export type CreditReferenceType = "ATS_ANALYSIS" | "PLAN" | "ADMIN";

export interface UserCreditsState {
  balance: number;
  monthlyLimit: number;
  used: number;
  resetAt: string | Date;
}

export interface CreditBalanceResponse {
  plan: PlanType;
  balance: number;
  used: number;
  limit: number;
  resetAt: string | null;
  isUnlimited: boolean;
  role: "user" | "admin";
}

export interface CreditTransactionItem {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: CreditReferenceType;
  referenceId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreditHistoryResponse {
  transactions: CreditTransactionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReservationResult {
  success: boolean;
  reservationId?: string;
  isUnlimited?: boolean;
  balanceBefore?: number;
  balanceAfter?: number;
  error?: string;
}
