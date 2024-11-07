-- CreateTable
CREATE TABLE "TicketMessage" (
    "ticketId" INTEGER NOT NULL,
    "messageId" TEXT NOT NULL,
    "supportSideEmbed" TEXT NOT NULL,
    "clientSideEmbed" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketMessage_messageId_key" ON "TicketMessage"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketMessage_supportSideEmbed_key" ON "TicketMessage"("supportSideEmbed");

-- CreateIndex
CREATE UNIQUE INDEX "TicketMessage_clientSideEmbed_key" ON "TicketMessage"("clientSideEmbed");

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
