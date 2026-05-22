-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('Leader', 'Officer', 'Elite', 'Member', 'Recruit');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'member');

-- CreateEnum
CREATE TYPE "ItemGrade" AS ENUM ('rare', 'heroic', 'legendary');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('active', 'finished');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('world_boss', 'rift', 'guild_dungeon', 'ancient_fortress', 'clash', 'abyss_boss');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('upcoming', 'completed');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('add', 'remove');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 60,
    "rank" "Rank" NOT NULL DEFAULT 'Member',
    "role" "Role" NOT NULL DEFAULT 'member',
    "points" INTEGER NOT NULL DEFAULT 150,
    "guild" TEXT NOT NULL DEFAULT 'RuinToo',
    "altNames" TEXT[],
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rpgProfile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemGrade" "ItemGrade" NOT NULL,
    "minBid" INTEGER NOT NULL,
    "currentBid" INTEGER NOT NULL,
    "currentWinnerId" TEXT,
    "currentWinnerName" TEXT,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "AuctionStatus" NOT NULL DEFAULT 'active',
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "allowedClasses" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'upcoming',
    "minLevel" INTEGER NOT NULL DEFAULT 60,
    "rewards" TEXT[],
    "weekday" TEXT,
    "time" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRsvp" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "EventRsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelUpRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LevelUpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelUpSlot" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "joinedById" TEXT NOT NULL,
    "joinedByName" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "isAlt" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LevelUpSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LevelUpHelper" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "memberOriginalName" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "isAlt" BOOLEAN NOT NULL DEFAULT false,
    "availability" TEXT NOT NULL,
    "weekday" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LevelUpHelper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "rank" "Rank" NOT NULL DEFAULT 'Recruit',
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_name_key" ON "Member"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EventRsvp_eventId_memberId_key" ON "EventRsvp"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_email_key" ON "Invite"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_code_key" ON "Invite"("code");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "GuildEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRsvp" ADD CONSTRAINT "EventRsvp_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelUpRequest" ADD CONSTRAINT "LevelUpRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelUpSlot" ADD CONSTRAINT "LevelUpSlot_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LevelUpRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelUpSlot" ADD CONSTRAINT "LevelUpSlot_joinedById_fkey" FOREIGN KEY ("joinedById") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LevelUpHelper" ADD CONSTRAINT "LevelUpHelper_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
