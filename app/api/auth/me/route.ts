import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userDoc = await UserModel.findById(authUser.id).select("-passwordHash").lean();
    if (!userDoc) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    const userData = {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: (userDoc as any).role || "user",
      plan: (userDoc as any).plan || "FREE",
      createdAt: userDoc.createdAt.toISOString(),
      updatedAt: userDoc.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: { user: userData },
      user: userData,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch current user profile",
        },
      },
      { status: 500 }
    );
  }
}
