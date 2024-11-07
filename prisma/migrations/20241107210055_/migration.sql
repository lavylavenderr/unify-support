/*
  Warnings:

  - You are about to drop the column `clientSideEmbed` on the `TicketMessage` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `TicketMessage` table. All the data in the column will be lost.
  - You are about to drop the column `supportSideEmbed` on the `TicketMessage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supportSideMsg]` on the table `TicketMessage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientSideMsg]` on the table `TicketMessage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientSideMsg` to the `TicketMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supportSideMsg` to the `TicketMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TicketMessage_clientSideEmbed_key";

-- DropIndex
DROP INDEX "TicketMessage_messageId_key";

-- DropIndex
DROP INDEX "TicketMessage_supportSideEmbed_key";

-- AlterTable
ALTER TABLE "TicketMessage" DROP COLUMN "clientSideEmbed",
DROP COLUMN "messageId",
DROP COLUMN "supportSideEmbed",
ADD COLUMN     "clientSideMsg" TEXT NOT NULL,
ADD COLUMN     "supportSideMsg" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TicketMessage_supportSideMsg_key" ON "TicketMessage"("supportSideMsg");

-- CreateIndex
CREATE UNIQUE INDEX "TicketMessage_clientSideMsg_key" ON "TicketMessage"("clientSideMsg");
