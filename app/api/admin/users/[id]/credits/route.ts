import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { CreditTransactionModel } from "@/lib/db/models/CreditTransaction";
import { getUserCreditState } from "@/lib/services/credits";

export async function GET(
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

    const creditState = await getUserCreditState(targetUserId);

    const transactions = await CreditTransactionModel.find({
      userId: new mongoose.Types.ObjectId(targetUserId),
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        credits: creditState,
        recentTransactions: transactions.map((t: any) => ({
          id: t._id.toString(),
          type: t.type,
          amount: t.amount,
          balanceBefore: t.balanceBefore,
          balanceAfter: t.balanceAfter,
          description: t.description,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/users/[id]/credits error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: error.message || "Failed to load user credits" } },
      { status: 500 }
    );
  }
}
