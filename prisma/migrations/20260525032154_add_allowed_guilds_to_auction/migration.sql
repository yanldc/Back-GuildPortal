-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "allowedGuilds" TEXT[] DEFAULT ARRAY['any']::TEXT[];
