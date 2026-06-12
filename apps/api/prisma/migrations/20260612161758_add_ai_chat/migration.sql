-- CreateTable
CREATE TABLE "ai_chat_messages" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_chat_messages_clerkId_idx" ON "ai_chat_messages"("clerkId");
