-- CreateEnum
CREATE TYPE "DeckStatus" AS ENUM ('PENDING', 'GENERATING', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "title" TEXT,
    "status" "DeckStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slides" (
    "id" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imagePrompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Slides_deckId_idx" ON "Slides"("deckId");

-- AddForeignKey
ALTER TABLE "Slides" ADD CONSTRAINT "Slides_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
