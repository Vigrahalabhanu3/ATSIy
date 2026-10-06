import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Email and password are required." },
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    const user = await UserModel.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
        },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || "user",
    });

    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "user",
          plan: user.plan || "FREE",
          createdAt: user.createdAt.toISOString(),
        },
      },
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Login failed. Please check your connection and try again." },
      },
      { status: 500 }
    );
  }
}
