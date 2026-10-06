import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const email = process.argv[2] || "banuvigrahala@gmail.com";
const password = process.argv[3] || "Bhanu@7671";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://banuvigrahala_db_user:YfrZytlvjmULpODj@cluster0.ccrpqdb.mongodb.net/atsly?appName=Cluster0&compressors=zlib";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const usersCol = mongoose.connection.collection("users");

  const hash = await bcrypt.hash(password, 10);
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await usersCol.findOne({ email: normalizedEmail });

  if (existing) {
    await usersCol.updateOne(
      { _id: existing._id },
      {
        $set: {
          role: "admin",
          plan: "ENTERPRISE",
          passwordHash: hash,
          "credits.balance": 999999,
          "credits.monthlyLimit": 999999,
          "credits.used": 0,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`✓ User ${normalizedEmail} successfully promoted to ADMIN with ENTERPRISE plan and unlimited credits.`);
  } else {
    await usersCol.insertOne({
      name: "Bhanu Prasad",
      email: normalizedEmail,
      passwordHash: hash,
      role: "admin",
      plan: "ENTERPRISE",
      credits: {
        balance: 999999,
        monthlyLimit: 999999,
        used: 0,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✓ Created new ADMIN user ${normalizedEmail} with ENTERPRISE plan and unlimited credits.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Error setting admin:", err);
  process.exit(1);
});
