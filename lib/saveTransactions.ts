import { prisma } from "@/lib/db";
import { formatCategory } from "./formatCategory";
import { Prisma } from "../generated/prisma/client";

export async function saveTransactions(transactions: any[], accountId: string) {
  for (const t of transactions) {
    const amount = new Prisma.Decimal(t.amount);

    // For manual imports, we might not have an external ID
    const externalId = t.transaction_id || null;

    if (externalId) {
      await prisma.transaction.upsert({
        where: { externalId: externalId },
        update: {
          amount,
          category: formatCategory(t),
          date: new Date(t.date),
          merchant: t.name || t.merchant,
        },
        create: {
          externalId: externalId,
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

