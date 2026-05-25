-- AlterTable
ALTER TABLE "GuildEvent" ADD COLUMN     "allowedGuilds" TEXT[] DEFAULT ARRAY['any']::TEXT[];
