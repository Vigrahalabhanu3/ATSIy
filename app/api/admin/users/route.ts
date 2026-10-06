import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";

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
    const adminUser = await UserModel.findById(authUser.id);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Administrator access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const filter: any = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const total = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formattedUsers = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role || "user",
      plan: u.plan || "FREE",
      credits: {
        balance: u.role === "admin" ? "unlimited" : (u.credits?.balance ?? 2),
        monthlyLimit: u.credits?.monthlyLimit ?? 2,
        used: u.credits?.used ?? 0,
        resetAt: u.credits?.resetAt ? new Date(u.credits.resetAt).toISOString() : null,
      },
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to list users" } },
      { status: 500 }
    );
  }
}
