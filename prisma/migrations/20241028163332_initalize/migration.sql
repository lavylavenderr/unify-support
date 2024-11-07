-- CreateEnum
CREATE TYPE "FlightStatus" AS ENUM ('Scheduled', 'Complete', 'Cancelled');

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "avatar" TEXT NOT NULL,
    "robloxId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "robloxUsername" TEXT NOT NULL,
    "discordUsername" TEXT NOT NULL,
    "suspended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightSignup" (
    "id" SERIAL NOT NULL,
    "flightId" INTEGER NOT NULL,
    "staffId" INTEGER NOT NULL,

    CONSTRAINT "FlightSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warning" (
    "id" SERIAL NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedToId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'No reason provided.',

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strike" (
    "id" SERIAL NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "issuedToId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'No reason provided.',

    CONSTRAINT "Strike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "status" "FlightStatus" NOT NULL,
    "routePair" TEXT NOT NULL,
    "aircraft" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unix" TIMESTAMP(3) NOT NULL,
    "allocationSent" BOOLEAN NOT NULL DEFAULT false,
    "allocationId" TEXT,

    CONSTRAINT "Flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Attendees" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_id_key" ON "Staff"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_robloxId_key" ON "Staff"("robloxId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_discordId_key" ON "Staff"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FlightSignup_id_key" ON "FlightSignup"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Warning_id_key" ON "Warning"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Strike_id_key" ON "Strike"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Flight_id_key" ON "Flight"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_Attendees_AB_unique" ON "_Attendees"("A", "B");

-- CreateIndex
CREATE INDEX "_Attendees_B_index" ON "_Attendees"("B");

-- AddForeignKey
ALTER TABLE "FlightSignup" ADD CONSTRAINT "FlightSignup_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightSignup" ADD CONSTRAINT "FlightSignup_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_issuedToId_fkey" FOREIGN KEY ("issuedToId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strike" ADD CONSTRAINT "Strike_issuedToId_fkey" FOREIGN KEY ("issuedToId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Attendees" ADD CONSTRAINT "_Attendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Attendees" ADD CONSTRAINT "_Attendees_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
