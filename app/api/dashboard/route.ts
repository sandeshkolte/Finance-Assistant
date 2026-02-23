import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { groupByCategory } from "@/lib/analytics";
import { monthlySummary } from "@/lib/analytics";
import { detectSubscriptions } from "@/lib/subscriptionDetector";
import { burnRate } from "@/lib/burnRate";
import { netWorth } from "@/lib/netWorth";
import { generateInsights } from "@/lib/insights";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      accounts: {
        include: { transactions: true },
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" });

  const allTransactions = user.accounts.flatMap(a => a.transactions);

return NextResponse.json({
  transactions: allTransactions,
  categoryBreakdown: groupByCategory(allTransactions),
  monthlySummary: monthlySummary(allTransactions),
  subscriptions: detectSubscriptions(allTransactions),
  burn: burnRate(allTransactions),
  netWorth: netWorth(user.accounts),
  insights: generateInsights(allTransactions, detectSubscriptions(allTransactions)),
});

}

