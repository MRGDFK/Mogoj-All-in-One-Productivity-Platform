-- Convert tags from String[] (PostgreSQL array) to Json (jsonb)
-- Each tag string becomes { "name": "<tag>", "color": "blue" } (default color)

-- Resources table
ALTER TABLE "resources" ADD COLUMN "tags_new" jsonb NOT NULL DEFAULT '[]';

UPDATE "resources" SET "tags_new" = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', t, 'color', 'blue')), '[]'::jsonb)
  FROM unnest("tags") AS t
);

ALTER TABLE "resources" DROP COLUMN "tags";
ALTER TABLE "resources" RENAME COLUMN "tags_new" TO "tags";

-- Tasks table
ALTER TABLE "tasks" ADD COLUMN "tags_new" jsonb NOT NULL DEFAULT '[]';

UPDATE "tasks" SET "tags_new" = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', t, 'color', 'blue')), '[]'::jsonb)
  FROM unnest("tags") AS t
);

ALTER TABLE "tasks" DROP COLUMN "tags";
ALTER TABLE "tasks" RENAME COLUMN "tags_new" TO "tags";
