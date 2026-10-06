import mongoose from "mongoose";
import { UserModel } from "@/lib/db/models/User";
import { CreditTransactionModel } from "@/lib/db/models/CreditTransaction";
import { PLAN_CONFIG, PlanType, CREDIT_RESET_DAYS } from "@/lib/config/plans";
import {
  CreditBalanceResponse,
  ReservationResult,
} from "@/types/credits";

/**
 * Ensures user has initialized credit record and executes monthly reset if due
 */
export async function getUserCreditState(userId: string): Promise<CreditBalanceResponse> {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const role = user.role || "user";
  const plan: PlanType = (user.plan && PLAN_CONFIG[user.plan]) ? user.plan : "FREE";
  const planInfo = PLAN_CONFIG[plan];
  const isUnlimited = role === "admin";

  let needsSave = false;

  // Initialize credits if missing on legacy accounts
  if (!user.credits || typeof user.credits.balance !== "number") {
    user.credits = {
      balance: planInfo.monthlyCredits,
      monthlyLimit: planInfo.monthlyCredits,
      used: 0,
      resetAt: new Date(Date.now() + CREDIT_RESET_DAYS * 24 * 60 * 60 * 1000),
    };
    user.role = role;
    user.plan = plan;

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          role: role,
          plan: plan,
          credits: user.credits,
        },
      }
    );

    // Only log initial allocation transaction if one does not already exist
    const existingAllocation = await CreditTransactionModel.findOne({
      userId: user._id,
      type: "ALLOCATED",
    });

    if (!existingAllocation) {
      await CreditTransactionModel.create({
        userId: user._id,
        type: "ALLOCATED",
        amount: planInfo.monthlyCredits,
        balanceBefore: 0,
        balanceAfter: planInfo.monthlyCredits,
        referenceType: "PLAN",
        referenceId: plan,
        description: `Initial ${planInfo.name} Plan Allocation`,
        metadata: { plan },
      });
    }
  }

  // Check if reset period has elapsed
  const now = new Date();
  if (user.credits.resetAt && new Date(user.credits.resetAt) <= now) {
    const prevBalance = user.credits.balance;
    user.credits.balance = planInfo.monthlyCredits;
    user.credits.monthlyLimit = planInfo.monthlyCredits;
    user.credits.used = 0;
    user.credits.resetAt = new Date(Date.now() + CREDIT_RESET_DAYS * 24 * 60 * 60 * 1000);
    needsSave = true;

    await CreditTransactionModel.create({
      userId: user._id,
      type: "ALLOCATED",
      amount: planInfo.monthlyCredits,
      balanceBefore: prevBalance,
      balanceAfter: planInfo.monthlyCredits,
      referenceType: "PLAN",
      referenceId: plan,
      description: `Monthly ${planInfo.name} Plan Credit Reset`,
      metadata: { plan, resetDate: now.toISOString() },
    });
  }

  if (needsSave) {
    await user.save();
  }

  return {
    plan,
    balance: isUnlimited ? 999999 : user.credits.balance,
    used: user.credits.used,
    limit: user.credits.monthlyLimit,
    resetAt: user.credits.resetAt ? new Date(user.credits.resetAt).toISOString() : null,
    isUnlimited,
    role,
  };
}

/**
 * Atomically reserves 1 credit for an ATS scan BEFORE calling external AI/Make
 * Prevents race conditions and double spends
 */
export async function reserveCredit(
  userId: string,
  referenceType: "ATS_ANALYSIS" = "ATS_ANALYSIS",
  metadata: Record<string, any> = {}
): Promise<ReservationResult> {
  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, error: "USER_NOT_FOUND" };
  }

  // Admin users bypass credit deduction
  if (user.role === "admin") {
    const adminReservationId = `admin_res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      reservationId: adminReservationId,
      isUnlimited: true,
      balanceBefore: 999999,
      balanceAfter: 999999,
    };
  }

  // Ensure user credit state is current (runs auto-reset if reset date passed)
  await getUserCreditState(userId);

  // Atomic reservation update: only matches if credits.balance > 0
  const updatedUser = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      "credits.balance": { $gt: 0 },
    },
    {
      $inc: { "credits.balance": -1 },
    },
    {
      new: true,
    }
  );

  if (!updatedUser) {
    return {
      success: false,
      error: "CREDITS_EXHAUSTED",
    };
  }

  const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const balanceBefore = updatedUser.credits.balance + 1;
  const balanceAfter = updatedUser.credits.balance;

  // Record RESERVED transaction in ledger
  await CreditTransactionModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "RESERVED",
    amount: 1,
    balanceBefore,
    balanceAfter,
    referenceType,
    referenceId: reservationId,
    description: "ATS Resume Analysis Credit Reservation",
    metadata: {
      ...metadata,
      reservationId,
    },
  });

  return {
    success: true,
    reservationId,
    isUnlimited: false,
    balanceBefore,
    balanceAfter,
  };
}

/**
 * Finalizes credit consumption after successful Make/Gemini ATS analysis
 */
export async function consumeCredit(
  userId: string,
  reservationId: string,
  analysisId: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  if (reservationId.startsWith("admin_")) {
    return; // Admin unlimited
  }

  // Increment usage count atomically
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $inc: { "credits.used": 1 },
    },
    { new: true }
  );

  if (!user) return;

  // Record CONSUMED transaction in ledger
  await CreditTransactionModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "CONSUMED",
    amount: 1,
    balanceBefore: user.credits.balance,
    balanceAfter: user.credits.balance,
    referenceType: "ATS_ANALYSIS",
    referenceId: analysisId,
    description: "ATS Resume Analysis Credit Consumed",
    metadata: {
      ...metadata,
      reservationId,
      analysisId,
    },
  });
}

/**
 * Restores reserved credit if Make/Gemini or processing failed
 */
export async function refundCredit(
  userId: string,
  reservationId: string,
  reason: string
): Promise<void> {
  if (reservationId.startsWith("admin_")) {
    return; // Admin unlimited
  }

  // Atomically refund the balance
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $inc: { "credits.balance": 1 },
    },
    { new: true }
  );

  if (!user) return;

  const balanceBefore = user.credits.balance - 1;
  const balanceAfter = user.credits.balance;

  // Record REFUNDED transaction in ledger
  await CreditTransactionModel.create({
    userId: new mongoose.Types.ObjectId(userId),
    type: "REFUNDED",
    amount: 1,
    balanceBefore,
    balanceAfter,
    referenceType: "ATS_ANALYSIS",
    referenceId: reservationId,
    description: `Credit Refund: ${reason}`,
    metadata: {
      reservationId,
      reason,
    },
  });
}

/**
 * Admin adjustment of a user's credits with mandatory audit trail
 */
export async function adjustUserCredits(
  adminUserId: string,
  targetUserId: string,
  amount: number,
  reason: string
): Promise<{ balance: number }> {
  const targetUser = await UserModel.findById(targetUserId);
  if (!targetUser) throw new Error("Target user not found");

  const balanceBefore = targetUser.credits?.balance || 0;
  const newBalance = Math.max(0, balanceBefore + amount);

  const updatedUser = await UserModel.findByIdAndUpdate(
    targetUserId,
    {
      $set: { "credits.balance": newBalance },
    },
    { new: true }
  );

  if (!updatedUser) throw new Error("Failed to adjust credits");

  await CreditTransactionModel.create({
    userId: new mongoose.Types.ObjectId(targetUserId),
    type: "ADJUSTED",
    amount,
    balanceBefore,
    balanceAfter: newBalance,
    referenceType: "ADMIN",
    referenceId: adminUserId,
    description: `Admin Credit Adjustment: ${reason}`,
    metadata: {
      adminUserId,
      reason,
    },
  });

  return { balance: newBalance };
}

/**
 * Admin change of user plan
 */
export async function changeUserPlan(
  adminUserId: string,
  targetUserId: string,
  newPlan: PlanType
): Promise<void> {
  const planInfo = PLAN_CONFIG[newPlan];
  if (!planInfo) throw new Error(`Invalid plan: ${newPlan}`);

  const user = await UserModel.findById(targetUserId);
  if (!user) throw new Error("User not found");

  const balanceBefore = user.credits?.balance || 0;
  user.plan = newPlan;
  user.credits.monthlyLimit = planInfo.monthlyCredits;
  user.credits.balance = planInfo.monthlyCredits;
  user.credits.used = 0;
  user.credits.resetAt = new Date(Date.now() + CREDIT_RESET_DAYS * 24 * 60 * 60 * 1000);

  await user.save();

  await CreditTransactionModel.create({
    userId: user._id,
    type: "PLAN_UPGRADE",
    amount: planInfo.monthlyCredits - balanceBefore,
    balanceBefore,
    balanceAfter: planInfo.monthlyCredits,
    referenceType: "ADMIN",
    referenceId: adminUserId,
    description: `Plan updated to ${planInfo.name} by administrator`,
    metadata: {
      adminUserId,
      newPlan,
    },
  });
}
