-- CreateEnum
CREATE TYPE "TicketCategories" AS ENUM ('Other', 'PR', 'ThreeDLogo', 'Livery', 'Uniform');

-- AlterTable
ALTER TABLE "Snippet" ADD COLUMN     "category" "TicketCategories" NOT NULL DEFAULT 'Other';
