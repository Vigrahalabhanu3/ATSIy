import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { CreditTransactionModel } from "@/lib/db/models/CreditTransaction";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const userObjectId = new mongoose.Types.ObjectId(authUser.id);
    const filter = { userId: userObjectId };

    const total = await CreditTransactionModel.countDocuments(filter);
    const transactions = await CreditTransactionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedTransactions = transactions.map((t: any) => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      balanceBefore: t.balanceBefore,
      balanceAfter: t.balanceAfter,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      description: t.description,
      metadata: t.metadata || {},
      createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
      transactions: formattedTransactions,
    });
  } catch (error: any) {
    console.error("GET /api/credits/history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to load credit transaction history",
        },
      },
      { status: 500 }
    );
  }
}
