-- AlterTable: projects.description changes from plain text to a TipTap JSON
-- document (matching tasks.description and resources.content). Existing
-- plain-text values are wrapped into a minimal doc instead of being dropped.
ALTER TABLE "projects"
  ALTER COLUMN "description" TYPE JSONB USING (
    CASE
      WHEN "description" IS NULL THEN NULL
      ELSE jsonb_build_object(
        'type', 'doc',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'paragraph',
            'content', jsonb_build_array(
              jsonb_build_object('type', 'text', 'text', "description")
            )
          )
        )
      )
    END
  );
