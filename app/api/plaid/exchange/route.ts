// export const runtime = "nodejs";

// import { NextResponse } from "next/server";
// import { plaidClient } from "@/lib/plaid";
// import { prisma } from "@/lib/db";
// import { auth } from "@clerk/nextjs/server";
// import { fetchTransactions } from "@/lib/plaid-fetch";
// import { saveTransactions } from "@/lib/saveTransactions";
// import { encrypt } from "@/lib/encryption";

// export async function POST(req: Request) {
//   const { userId: clerkId } = await auth();

//   if (!clerkId)
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//   const dbUser = await prisma.user.findUnique({
//     where: { clerkId },
//   });

//   if (!dbUser) {
//     return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
//   }

//   const { public_token } = await req.json();

//   // Exchange token
//   const response = await plaidClient.itemPublicTokenExchange({
//     public_token,
//   });

//   const access_token = response.data.access_token;

//   // Save account
//   const account = await prisma.account.create({
//     data: {
//       userId: dbUser.id,
//       bankName: "Connected Bank",
//       accountType: "Checking",
//       balance: 0,
//       accessToken: encrypt(access_token),
//     },
//   });


//   // 🔥 STEP 8 — FETCH TRANSACTIONS
//   const transactions = await fetchTransactions(access_token);

//   // SAVE TO DB
//   await saveTransactions(transactions, account.id);
//   console.log("Transactions:", transactions);

//   return NextResponse.json({ success: true });
// }
