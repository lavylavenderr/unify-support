/*
  Warnings:

  - You are about to drop the column `runId` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "runId",
ADD COLUMN     "scheduledCloseTime" TIMESTAMP(3);
