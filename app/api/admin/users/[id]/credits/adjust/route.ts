import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { adjustUserCredits } from "@/lib/services/credits";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const adminUser = await UserModel.findById(authUser.id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Administrator access required" } },
        { status: 403 }
      );
    }

    const { id: targetUserId } = await params;
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_USER_ID", message: "Invalid user ID" } },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { amount, reason } = body;

    if (typeof amount !== "number" || isNaN(amount) || amount === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_AMOUNT", message: "Please provide a valid non-zero adjustment amount" } },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REASON", message: "An audit reason is required for credit adjustments" } },
        { status: 400 }
      );
    }

    const result = await adjustUserCredits(
      authUser.id,
      targetUserId,
      amount,
      reason.trim()
    );

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully adjusted credits by ${amount > 0 ? `+${amount}` : amount}`,
        newBalance: result.balance,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/users/[id]/credits/adjust error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to adjust credits" } },
      { status: 500 }
    );
  }
}
