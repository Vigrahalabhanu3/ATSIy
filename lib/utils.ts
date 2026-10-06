import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong Match";
  if (score >= 65) return "Good Match";
  if (score >= 50) return "Moderate Match";
  return "Weak Match";
}

export function getProgressPercentage(score: number, max: number): number {
  return Math.round((score / max) * 100);
}
