-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIVE', 'DRAFT');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'ACTIVE';
