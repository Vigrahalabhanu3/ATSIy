import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { getUserCreditState } from "@/lib/services/credits";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const creditState = await getUserCreditState(authUser.id);

    return NextResponse.json({
      success: true,
      data: creditState,
      // Provide top-level convenience fields matching prompt specifications
      plan: creditState.plan,
      balance: creditState.balance,
      used: creditState.used,
      limit: creditState.limit,
      resetAt: creditState.resetAt,
      isUnlimited: creditState.isUnlimited,
    });
  } catch (error: any) {
    console.error("GET /api/credits error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve user credit balance",
        },
      },
      { status: 500 }
    );
  }
}
