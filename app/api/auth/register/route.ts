import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { UserModel } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name is required." } },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "A valid email is required." } },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters long." },
        },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Passwords do not match." } },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if email already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "EMAIL_EXISTS", message: "An account with this email address already exists." },
        },
        { status: 409 }
      );
    }

    // Determine role (owner/admin if email matches ADMIN_EMAIL)
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const role = (adminEmail && normalizedEmail === adminEmail) ? "admin" : "user";
    const initialCredits = 2;

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      plan: "FREE",
      credits: {
        balance: initialCredits,
        monthlyLimit: initialCredits,
        used: 0,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Record initial allocation in ledger
    import("@/lib/db/models/CreditTransaction").then(({ CreditTransactionModel }) => {
      CreditTransactionModel.create({
        userId: user._id,
        type: "ALLOCATED",
        amount: initialCredits,
        balanceBefore: 0,
        balanceAfter: initialCredits,
        referenceType: "PLAN",
        referenceId: "FREE",
        description: "Initial Free Plan Credit Allocation",
        metadata: { plan: "FREE" },
      }).catch((e) => console.error("Error logging initial credit allocation:", e));
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || role,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || role,
            plan: user.plan || "FREE",
            createdAt: user.createdAt.toISOString(),
          },
        },
        token,
      },
      { status: 201 }
    );

    // Set HTTP-only cookie using response.cookies
    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Register API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Registration failed. Please try again later." },
      },
      { status: 500 }
    );
  }
}
