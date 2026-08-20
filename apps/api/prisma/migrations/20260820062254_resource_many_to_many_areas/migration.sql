/*
  Warnings:

  - You are about to drop the column `areaId` on the `resources` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_areaId_fkey";

-- DropIndex
DROP INDEX "resources_areaId_idx";

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "areaId";

-- CreateTable
CREATE TABLE "_ResourceAreas" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceAreas_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ResourceAreas_B_index" ON "_ResourceAreas"("B");

-- AddForeignKey
ALTER TABLE "_ResourceAreas" ADD CONSTRAINT "_ResourceAreas_A_fkey" FOREIGN KEY ("A") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceAreas" ADD CONSTRAINT "_ResourceAreas_B_fkey" FOREIGN KEY ("B") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
