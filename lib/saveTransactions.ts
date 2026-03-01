import { prisma } from "@/lib/db";
import { formatCategory } from "./formatCategory";
import { Prisma } from "../generated/prisma/client";

export async function saveTransactions(transactions: any[], accountId: string) {
  for (const t of transactions) {
    const amount = new Prisma.Decimal(t.amount);

    // For manual imports, we might not have a plaidTransactionId
    const plaidId = t.transaction_id || t.plaidTransactionId || null;

    if (plaidId) {
      await prisma.transaction.upsert({
        where: { externalId: plaidId },
        update: {
          amount,
          category: formatCategory(t),
          date: new Date(t.date),
          merchant: t.name || t.merchant,
        },
        create: {
          externalId: plaidId,
          amount,
          category: formatCategory(t),
          date: new Date(t.date),
          merchant: t.name || t.merchant,
          accountId,
        },
      });
    } else {
      // Direct create for records without external IDs
      await prisma.transaction.create({
        data: {
          amount,
          category: formatCategory(t),
          date: new Date(t.date),
          merchant: t.name || t.merchant,
          accountId,
        },
      });
    }
  }
}

