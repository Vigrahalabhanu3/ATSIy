import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { changeUserPlan } from "@/lib/services/credits";
import { PLAN_CONFIG, PlanType } from "@/lib/config/plans";

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
    const { plan } = body;

    if (!plan || !PLAN_CONFIG[plan as PlanType]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PLAN",
            message: `Plan must be one of: ${Object.keys(PLAN_CONFIG).join(", ")}`,
          },
        },
        { status: 400 }
      );
    }

    await changeUserPlan(authUser.id, targetUserId, plan as PlanType);

    return NextResponse.json({
      success: true,
      data: {
        message: `User plan successfully updated to ${plan}`,
        plan,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/users/[id]/plan error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to update user plan" } },
      { status: 500 }
    );
  }
}
