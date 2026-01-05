-- AlterTable
ALTER TABLE "Unit" ALTER COLUMN "type" TYPE TEXT USING "type"::text;

-- DropEnum
DROP TYPE "UnitType";
