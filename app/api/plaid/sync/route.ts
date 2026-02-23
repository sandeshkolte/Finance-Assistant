import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { plaidClient } from "@/lib/plaid";
import { auth } from "@clerk/nextjs/server";
import { formatCategory } from "@/lib/formatCategory";
import { decrypt } from "@/lib/encryption";

export const runtime = "nodejs";

export async function POST() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { accounts: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" });

  for (const account of user.accounts) {
    if (!account.plaidAccessToken) continue;

    let hasMore = true;
    let cursor = account.lastSyncCursor;

    while (hasMore) {
      const res = await plaidClient.transactionsSync({
        access_token: decrypt(account.plaidAccessToken),
        cursor: cursor ?? undefined,
      });

      const { added, modified, removed, next_cursor, has_more } = res.data;

      // 1. Handle Added
      for (const t of added) {
        await prisma.transaction.upsert({
          where: { plaidTransactionId: t.transaction_id },
          update: {
            amount: t.amount,
            category: formatCategory(t),
            date: new Date(t.date),
            merchant: t.name,
            status: t.pending ? "pending" : "posted",
          },
          create: {
            plaidTransactionId: t.transaction_id,
            amount: t.amount,
            category: formatCategory(t),
            date: new Date(t.date),
            merchant: t.name,
            status: t.pending ? "pending" : "posted",
            accountId: account.id,
          },
        });
      }

      // 2. Handle Modified
      for (const t of modified) {
        await prisma.transaction.updateMany({
          where: { plaidTransactionId: t.transaction_id },
          data: {
            amount: t.amount,
            category: formatCategory(t),
            date: new Date(t.date),
            merchant: t.name,
            status: t.pending ? "pending" : "posted",
          },
        });
      }

      // 3. Handle Removed
      for (const t of removed) {
        if (!t.transaction_id) continue;
        await prisma.transaction.deleteMany({
          where: { plaidTransactionId: t.transaction_id },
        });
      }

      cursor = next_cursor;
      hasMore = has_more;
    }

    // Update cursor for next sync
    await prisma.account.update({
      where: { id: account.id },
      data: { lastSyncCursor: cursor },
    });
  }

  return NextResponse.json({ success: true });
}
