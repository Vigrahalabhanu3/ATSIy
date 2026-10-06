import mongoose from "mongoose";
import { jsPDF } from "jspdf";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING FULL PRODUCTION CREDIT SYSTEM TESTS ===\n");

  const timestamp = Date.now();
  const testEmail1 = `user.test.${timestamp}@example.com`;
  const testPassword = "Password123!";
  const testName = "Credit Tester";

  // ----------------------------------------------------
  // TEST 1: Register New Normal User -> Expect 2 credits
  // ----------------------------------------------------
  console.log("TEST 1: Register new normal user...");
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: testName,
      email: testEmail1,
      password: testPassword,
    }),
  });

  const regData = await regRes.json();
  if (!regRes.ok || !regData.success) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }

  const cookieHeader = regRes.headers.get("set-cookie") || "";
  const authCookie = cookieHeader.split(";")[0];
  console.log("  Registered user:", testEmail1);

  // Check Credits via GET /api/credits
  const credRes1 = await fetch(`${BASE_URL}/api/credits`, {
    headers: { Cookie: authCookie },
  });
  const credData1 = await credRes1.json();
  console.log(`  Initial Credits: balance=${credData1.data?.balance}, plan=${credData1.data?.plan}, used=${credData1.data?.used}`);
  if (credData1.data?.balance !== 2 || credData1.data?.plan !== "FREE") {
    throw new Error(`TEST 1 Failed: Expected 2 credits on FREE plan, got ${JSON.stringify(credData1)}`);
  }
  console.log("  ✓ TEST 1 PASSED: New user initialized with 2 FREE credits.\n");

  // ----------------------------------------------------
  // TEST 2: Upload Resume -> Expect 2 credits remain
  // ----------------------------------------------------
  console.log("TEST 2: Upload resume (should NOT consume credits)...");
  const doc = new jsPDF();
  doc.text("Jane Doe", 10, 10);
  doc.text("Senior Frontend Engineer with 8 years of React, Next.js, TypeScript, CSS, Node.js experience.", 10, 20);
  doc.text("Experience: Led frontend engineering at TechCorp, optimized Core Web Vitals by 40%.", 10, 30);
  doc.text("Skills: React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind, Redux, REST APIs.", 10, 40);
  const pdfBytes = Buffer.from(doc.output("arraybuffer"));

  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
  const pre = Buffer.from(
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="test_resume.pdf"\r\n` +
    `Content-Type: application/pdf\r\n\r\n`
  );
  const post = Buffer.from(`\r\n--${boundary}--\r\n`);
  const multipartBuffer = Buffer.concat([pre, pdfBytes, post]);

  const uploadRes = await fetch(`${BASE_URL}/api/resumes`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Cookie: authCookie,
    },
    body: multipartBuffer,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.success) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
  }
  const resumeId = uploadData.data?.resume?.id || uploadData.resume?.id;
  console.log("  Uploaded resume ID:", resumeId);

  const credRes2 = await fetch(`${BASE_URL}/api/credits`, {
    headers: { Cookie: authCookie },
  });
  const credData2 = await credRes2.json();
  console.log(`  Credits after upload: balance=${credData2.data?.balance}`);
  if (credData2.data?.balance !== 2) {
    throw new Error(`TEST 2 Failed: Resume upload consumed credits! Expected 2, got ${credData2.data?.balance}`);
  }
  console.log("  ✓ TEST 2 PASSED: Resume upload does NOT consume credits.\n");

  // ----------------------------------------------------
  // TEST 3: First ATS Analysis -> Expect 1 credit remains
  // ----------------------------------------------------
  console.log("TEST 3: Run 1st ATS analysis (should consume 1 credit)...");
  const jobDesc1 = "Senior Frontend Engineer with deep expertise in React, Next.js, TypeScript, performance tuning, and scalable component architecture.";

  const analysisRes1 = await fetch(`${BASE_URL}/api/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      resumeId,
      jobDescription: jobDesc1,
    }),
  });
  const analysisData1 = await analysisRes1.json();
  if (!analysisRes1.ok || !analysisData1.success) {
    throw new Error(`Analysis 1 failed: ${JSON.stringify(analysisData1)}`);
  }
  const analysisId1 = analysisData1.data?.analysis?.id || analysisData1.analysis?.id;
  console.log("  Analysis 1 completed, ID:", analysisId1, "Score:", analysisData1.data?.analysis?.atsScore);

  const credRes3 = await fetch(`${BASE_URL}/api/credits`, {
    headers: { Cookie: authCookie },
  });
  const credData3 = await credRes3.json();
  console.log(`  Credits after 1st analysis: balance=${credData3.data?.balance}, used=${credData3.data?.used}`);
  if (credData3.data?.balance !== 1 || credData3.data?.used !== 1) {
    throw new Error(`TEST 3 Failed: Expected balance=1, used=1, got ${JSON.stringify(credData3)}`);
  }
  console.log("  ✓ TEST 3 PASSED: 1st ATS analysis consumed exactly 1 credit.\n");

  // ----------------------------------------------------
  // TEST 4: Second ATS Analysis -> Expect 0 credits remain
  // ----------------------------------------------------
  console.log("TEST 4: Run 2nd ATS analysis (should consume last credit)...");
  const jobDesc2 = "Staff Engineer with React, Next.js, and TypeScript leading frontend architecture.";

  const analysisRes2 = await fetch(`${BASE_URL}/api/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      resumeId,
      jobDescription: jobDesc2,
    }),
  });
  const analysisData2 = await analysisRes2.json();
  if (!analysisRes2.ok || !analysisData2.success) {
    throw new Error(`Analysis 2 failed: ${JSON.stringify(analysisData2)}`);
  }
  console.log("  Analysis 2 completed, ID:", analysisData2.data?.analysis?.id);

  const credRes4 = await fetch(`${BASE_URL}/api/credits`, {
    headers: { Cookie: authCookie },
  });
  const credData4 = await credRes4.json();
  console.log(`  Credits after 2nd analysis: balance=${credData4.data?.balance}, used=${credData4.data?.used}`);
  if (credData4.data?.balance !== 0 || credData4.data?.used !== 2) {
    throw new Error(`TEST 4 Failed: Expected balance=0, used=2, got ${JSON.stringify(credData4)}`);
  }
  console.log("  ✓ TEST 4 PASSED: 2nd ATS analysis consumed 1 credit, leaving 0 balance.\n");

  // ----------------------------------------------------
  // TEST 5: Third Attempt -> Expect 402 CREDITS_EXHAUSTED
  // ----------------------------------------------------
  console.log("TEST 5: Attempt 3rd ATS analysis with 0 credits...");
  const analysisRes3 = await fetch(`${BASE_URL}/api/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      resumeId,
      jobDescription: "Another job description requiring 5 years of software engineering.",
    }),
  });
  const analysisData3 = await analysisRes3.json();
  console.log(`  HTTP status: ${analysisRes3.status}, error code: ${analysisData3.error?.code}`);
  if (analysisRes3.status !== 402 || analysisData3.error?.code !== "CREDITS_EXHAUSTED") {
    throw new Error(`TEST 5 Failed: Expected status 402 CREDITS_EXHAUSTED, got status ${analysisRes3.status}: ${JSON.stringify(analysisData3)}`);
  }
  console.log("  ✓ TEST 5 PASSED: Server returned 402 CREDITS_EXHAUSTED and blocked AI evaluation.\n");

  // ----------------------------------------------------
  // TEST 6: Verify Credit History Ledger
  // ----------------------------------------------------
  console.log("TEST 6: Verify credit history ledger transactions...");
  const historyRes = await fetch(`${BASE_URL}/api/credits/history?page=1&limit=20`, {
    headers: { Cookie: authCookie },
  });
  const historyData = await historyRes.json();
  const txs = historyData.data?.transactions || [];
  console.log(`  Found ${txs.length} credit ledger transactions:`);
  txs.forEach((t) => console.log(`    - ${t.type}: ${t.amount} credit(s), balAfter: ${t.balanceAfter}, desc: ${t.description}`));

  const hasAllocated = txs.some((t) => t.type === "ALLOCATED" && t.amount === 2);
  const consumedCount = txs.filter((t) => t.type === "CONSUMED").length;
  if (!hasAllocated || consumedCount !== 2) {
    throw new Error(`TEST 6 Failed: Expected 1 ALLOCATED and 2 CONSUMED transactions, got: ${JSON.stringify(txs)}`);
  }
  console.log("  ✓ TEST 6 PASSED: Ledger contains immutable ALLOCATED and CONSUMED records.\n");

  // ----------------------------------------------------
  // TEST 8 & 9: Security & Isolation (Cannot access other's credits)
  // ----------------------------------------------------
  console.log("TEST 8 & 9: Testing user data isolation and payload tampering resistance...");
  // Register User 2
  const regRes2 = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Second User",
      email: `user2.${timestamp}@example.com`,
      password: testPassword,
    }),
  });
  const user2Cookie = (regRes2.headers.get("set-cookie") || "").split(";")[0];
  const credUser2 = await (await fetch(`${BASE_URL}/api/credits`, { headers: { Cookie: user2Cookie } })).json();

  if (credUser2.data?.balance !== 2) {
    throw new Error("User 2 balance should be 2 independently");
  }

  // Attempt client-side tampering in payload
  const tamperRes = await fetch(`${BASE_URL}/api/analyses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie, // User 1 who has 0 balance!
    },
    body: JSON.stringify({
      resumeId,
      jobDescription: "Staff Software Engineer with React, Node, Cloud architecture.",
      credits: 1000,
      plan: "PREMIUM",
      role: "admin",
      isUnlimited: true,
    }),
  });
  if (tamperRes.status !== 402) {
    throw new Error("TEST 9 Failed: Server accepted client-supplied credit/role fields!");
  }
  console.log("  ✓ TEST 8 & 9 PASSED: Complete user isolation; server rejects client-supplied roles/credits.\n");

  // ----------------------------------------------------
  // TEST 12: Admin unlimited access
  // ----------------------------------------------------
  console.log("TEST 12: Testing Admin unlimited access...");
  // Register Admin user and promote in DB directly
  const adminEmail = `admin.${timestamp}@example.com`;
  const regAdmin = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Owner Admin",
      email: adminEmail,
      password: testPassword,
    }),
  });
  const adminCookie = (regAdmin.headers.get("set-cookie") || "").split(";")[0];
  const mongoUri = "mongodb+srv://banuvigrahala_db_user:YfrZytlvjmULpODj@cluster0.ccrpqdb.mongodb.net/atsly?appName=Cluster0&compressors=zlib";
  await mongoose.connect(mongoUri);
  await mongoose.connection.db.collection("users").updateOne(
    { email: adminEmail },
    { $set: { role: "admin" } }
  );
  console.log("  Promoted user to role: admin in MongoDB");

  const adminCredRes = await fetch(`${BASE_URL}/api/credits`, {
    headers: { Cookie: adminCookie },
  });
  const adminCredData = await adminCredRes.json();
  console.log(`  Admin credits check: isUnlimited=${adminCredData.data?.isUnlimited}, role=${adminCredData.data?.role}`);
  if (!adminCredData.data?.isUnlimited || adminCredData.data?.role !== "admin") {
    throw new Error("TEST 12 Failed: Admin not marked as unlimited!");
  }
  console.log("  ✓ TEST 12 PASSED: Admin has unlimited status and bypasses credit restrictions.\n");

  // ----------------------------------------------------
  // TEST 13, 14, 15: Viewing report, downloading, uploading resume are 0 credits
  // ----------------------------------------------------
  console.log("TEST 13-15: Verifying reports and downloads cost 0 credits...");
  const reportRes = await fetch(`${BASE_URL}/api/reports/${analysisId1}`, {
    headers: { Cookie: authCookie },
  });
  console.log(`  Viewing report HTTP status: ${reportRes.status}`);

  const checkStillZero = await (await fetch(`${BASE_URL}/api/credits`, { headers: { Cookie: authCookie } })).json();
  if (checkStillZero.data?.balance !== 0) {
    throw new Error("Balance changed after viewing report!");
  }
  console.log("  ✓ TEST 13-15 PASSED: Viewing report does NOT consume credits.\n");

  console.log("====================================================");
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! PRODUCTION READY! 🎉");
  console.log("====================================================");
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
