/*
  Warnings:

  - You are about to alter the column `balance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(19,4)`.
  - A unique constraint covering the columns `[plaidAccountId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plaidTransactionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "lastSyncCursor" TEXT,
ADD COLUMN     "plaidAccountId" TEXT,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(19,4);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "plaidTransactionId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'posted',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(19,4);

-- CreateIndex
CREATE UNIQUE INDEX "Account_plaidAccountId_key" ON "Account"("plaidAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_plaidTransactionId_key" ON "Transaction"("plaidTransactionId");
