-- AlterEnum
ALTER TYPE "EntityType" ADD VALUE 'note';

-- AlterTable
ALTER TABLE "areas" ALTER COLUMN "color" SET DEFAULT '#000000';

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "description" SET DATA TYPE TEXT USING "description"::text,
ALTER COLUMN "color" SET DEFAULT '#000000';

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "areaId" TEXT,
    "resourceId" TEXT,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ResourceProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceProjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "notes"("userId");

-- CreateIndex
CREATE INDEX "notes_projectId_idx" ON "notes"("projectId");

-- CreateIndex
CREATE INDEX "notes_areaId_idx" ON "notes"("areaId");

-- CreateIndex
CREATE INDEX "notes_resourceId_idx" ON "notes"("resourceId");

-- CreateIndex
CREATE INDEX "_ResourceProjects_B_index" ON "_ResourceProjects"("B");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceProjects" ADD CONSTRAINT "_ResourceProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceProjects" ADD CONSTRAINT "_ResourceProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DataMigration: preserve existing single project links into the new join table
-- before dropping the scalar column below.
INSERT INTO "_ResourceProjects" ("A", "B")
SELECT "projectId", "id" FROM "resources" WHERE "projectId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_projectId_fkey";

-- DropIndex
DROP INDEX "resources_projectId_idx";

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "projectId";
