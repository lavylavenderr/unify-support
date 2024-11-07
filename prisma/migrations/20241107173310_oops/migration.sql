/*
  Warnings:

  - You are about to drop the column `category` on the `Snippet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Snippet" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "category" "TicketCategories" NOT NULL DEFAULT 'Other';
