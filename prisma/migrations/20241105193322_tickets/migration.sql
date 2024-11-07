-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "subscribed" TEXT[],

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_id_key" ON "Ticket"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_channelId_key" ON "Ticket"("channelId");
