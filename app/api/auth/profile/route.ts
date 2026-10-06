import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, clearAuthCookieHeader } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { ResumeModel } from "@/lib/db/models/Resume";
import { AnalysisModel } from "@/lib/db/models/Analysis";
import { ReportModel } from "@/lib/db/models/Report";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { deleteFromCloudinary } from "@/lib/services/cloudinary";

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    await connectToDatabase();
    const user = await UserModel.findById(authUser.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    if (name && typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    // Change password flow
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "CURRENT_PASSWORD_REQUIRED", message: "Current password is required to set a new password" },
          },
          { status: 400 }
        );
      }

      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password does not match" },
          },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "PASSWORD_TOO_SHORT", message: "New password must be at least 8 characters" },
          },
          { status: 400 }
        );
      }

      user.passwordHash = await hashPassword(newPassword);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("PATCH /api/auth/profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // 1. Delete all Cloudinary files for user
    const resumes = await ResumeModel.find({ userId: authUser.id }).select("publicId");
    for (const r of resumes) {
      if (r.publicId) {
        try {
          await deleteFromCloudinary(r.publicId);
        } catch (e) {
          console.warn("Error deleting Cloudinary asset:", e);
        }
      }
    }

    // 2. Delete database records
    await ResumeModel.deleteMany({ userId: authUser.id });
    await AnalysisModel.deleteMany({ userId: authUser.id });
    await ReportModel.deleteMany({ userId: authUser.id });
    await UserModel.deleteOne({ _id: authUser.id });

    // 3. Clear cookie
    const response = NextResponse.json({
      success: true,
      data: { message: "Account deleted successfully" },
    });
    response.headers.set("Set-Cookie", clearAuthCookieHeader());
    return response;
  } catch (error) {
    console.error("DELETE /api/auth/profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete account" } },
      { status: 500 }
    );
  }
}
