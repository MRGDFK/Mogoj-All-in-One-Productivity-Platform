import type { EntityType, ActivityAction } from "@mogoj/shared";
import { prisma } from "../../config/db.js";
import { toJsonInput } from "../../utils/prismaJson.js";

interface LogActivityInput {
  userId: string;
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
}

// Fire-and-forget from the caller's perspective is tempting, but we await it
// so a logging failure surfaces instead of silently vanishing. Called from
// every other service after a significant mutation.
export async function writeActivityLog(input: LogActivityInput): Promise<void> {
  await prisma.activityLog.create({
    data: {
      userId: input.userId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      metadata: toJsonInput(input.metadata ?? {}),
    },
  });
}
