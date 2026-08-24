-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('open', 'closed');

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "status" "ResourceStatus" NOT NULL DEFAULT 'open';

-- CreateTable
CREATE TABLE "_ResourceTasks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ResourceTasks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ResourceTasks_B_index" ON "_ResourceTasks"("B");

-- AddForeignKey
ALTER TABLE "_ResourceTasks" ADD CONSTRAINT "_ResourceTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ResourceTasks" ADD CONSTRAINT "_ResourceTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
