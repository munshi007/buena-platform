/*
  Warnings:

  - You are about to drop the column `mimeType` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `originalName` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `sha256` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `sizeBytes` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `storageKey` on the `Document` table. All the data in the column will be lost.
  - Added the required column `name` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentKind" ADD VALUE 'LEASE';
ALTER TYPE "DocumentKind" ADD VALUE 'FLOOR_PLAN';
ALTER TYPE "DocumentKind" ADD VALUE 'MAINTENANCE_RECORD';
ALTER TYPE "DocumentKind" ADD VALUE 'INSURANCE_POLICY';
ALTER TYPE "DocumentKind" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "mimeType",
DROP COLUMN "originalName",
DROP COLUMN "sha256",
DROP COLUMN "sizeBytes",
DROP COLUMN "storageKey",
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "sha256" TEXT,
    "extractedData" JSONB,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
