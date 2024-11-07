/*
  Warnings:

  - You are about to drop the `Flight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FlightSignup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Staff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Strike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Warning` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_Attendees` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `claimedBy` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FlightSignup" DROP CONSTRAINT "FlightSignup_flightId_fkey";

-- DropForeignKey
ALTER TABLE "FlightSignup" DROP CONSTRAINT "FlightSignup_staffId_fkey";

-- DropForeignKey
ALTER TABLE "Strike" DROP CONSTRAINT "Strike_issuedToId_fkey";

-- DropForeignKey
ALTER TABLE "Warning" DROP CONSTRAINT "Warning_issuedToId_fkey";

-- DropForeignKey
ALTER TABLE "_Attendees" DROP CONSTRAINT "_Attendees_A_fkey";

-- DropForeignKey
ALTER TABLE "_Attendees" DROP CONSTRAINT "_Attendees_B_fkey";

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "claimedBy" TEXT NOT NULL;

-- DropTable
DROP TABLE "Flight";

-- DropTable
DROP TABLE "FlightSignup";

-- DropTable
DROP TABLE "Staff";

-- DropTable
DROP TABLE "Strike";

-- DropTable
DROP TABLE "Warning";

-- DropTable
DROP TABLE "_Attendees";

-- DropEnum
DROP TYPE "FlightStatus";

-- CreateTable
CREATE TABLE "Snippet" (
    "id" SERIAL NOT NULL,
    "identifier" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Snippet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Snippet_id_key" ON "Snippet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Snippet_identifier_key" ON "Snippet"("identifier");
