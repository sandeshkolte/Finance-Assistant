import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { groupByCategory } from "@/lib/analytics";
import { monthlySummary } from "@/lib/analytics";
import { detectSubscriptions } from "@/lib/subscriptionDetector";
import { burnRate } from "@/lib/burnRate";
import { netWorth } from "@/lib/netWorth";
import { generateInsights } from "@/lib/insights";

export async function GET() {
  const clerkUser = await currentUser();

  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "no-email@example.com";
  const name = clerkUser.firstName || clerkUser.username || "User";

  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email,
      name,
    },
    include: {
      accounts: {
        include: { transactions: true },
      },
    },
  });

  const allTransactions = user.accounts.flatMap(a => a.transactions);

  return NextResponse.json({
    hasConnectedBank: user.accounts.length > 0,
    accounts: user.accounts, // Added raw accounts
    transactions: allTransactions,
    categoryBreakdown: groupByCategory(allTransactions),
    monthlySummary: monthlySummary(allTransactions),
    subscriptions: detectSubscriptions(allTransactions),
    burn: burnRate(allTransactions),
    netWorth: netWorth(user.accounts),
    insights: generateInsights(allTransactions, detectSubscriptions(allTransactions)),
  });

}

