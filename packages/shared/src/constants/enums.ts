// Mirrors the enums defined in apps/api/prisma/schema.prisma.
// Keep these two files in sync manually — Prisma enums can't be imported
// into a package that doesn't depend on @prisma/client.

export const AreaStatus = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;
export type AreaStatus = (typeof AreaStatus)[keyof typeof AreaStatus];

export const ProjectStatus = {
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const TaskStatus = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  DONE: "done",
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const Priority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const ResourceType = {
  NOTE: "note",
  PDF: "pdf",
  LINK: "link",
  IMAGE: "image",
} as const;
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

export const ResourceStatus = {
  OPEN: "open",
  CLOSED: "closed",
} as const;
export type ResourceStatus = (typeof ResourceStatus)[keyof typeof ResourceStatus];

export const InboxType = {
  TASK: "task",
  PROJECT: "project",
  NOTE: "note",
  IDEA: "idea",
} as const;
export type InboxType = (typeof InboxType)[keyof typeof InboxType];

export const InboxStatus = {
  CAPTURED: "captured",
  PROCESSED: "processed",
} as const;
export type InboxStatus = (typeof InboxStatus)[keyof typeof InboxStatus];

export const EntityType = {
  TASK: "task",
  PROJECT: "project",
  AREA: "area",
  RESOURCE: "resource",
  NOTE: "note",
  INBOX: "inbox",
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const ActivityAction = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted",
  ARCHIVED: "archived",
  MOVED: "moved",
  COMPLETED: "completed",
  PROMOTED: "promoted",
} as const;
export type ActivityAction = (typeof ActivityAction)[keyof typeof ActivityAction];

export const KANBAN_COLUMNS: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];
