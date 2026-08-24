-- Icon names must match the PascalCase keys in the frontend's ICON_LIBRARY
-- (apps/web/lib/iconRegistry.ts), which mirror lucide-react's export names.
-- The previous lowercase defaults ("folder"/"rocket") rendered as raw text
-- instead of an icon until a user manually reselected one.

-- AlterTable
ALTER TABLE "areas" ALTER COLUMN "icon" SET DEFAULT 'Folder';

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "icon" SET DEFAULT 'Rocket';

-- DataMigration: fix rows already stored with the old lowercase icon names.
UPDATE "areas" SET "icon" = 'Folder' WHERE "icon" = 'folder';
UPDATE "areas" SET "icon" = 'Home' WHERE "icon" = 'home';
UPDATE "areas" SET "icon" = 'Briefcase' WHERE "icon" = 'briefcase';
UPDATE "projects" SET "icon" = 'Rocket' WHERE "icon" = 'rocket';
