import { NextResponse } from "next/server";
import { PLAN_CONFIG } from "@/lib/config/plans";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      plans: PLAN_CONFIG,
    },
    plans: PLAN_CONFIG,
  });
}
