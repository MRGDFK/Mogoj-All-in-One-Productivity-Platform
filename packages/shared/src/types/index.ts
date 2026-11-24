// Generic API response envelope shared by every endpoint.

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface TipTapDocument {
  type: "doc";
  content?: unknown[];
  [key: string]: unknown;
}

// Entity shapes as they come back over the wire (Dates are ISO strings —
// these mirror the Prisma models without the frontend depending on
// @prisma/client, which is a Node-only, backend package).

import type {
  AreaStatus,
  ProjectStatus,
  TaskStatus,
  Priority,
  ResourceType,
  ResourceStatus,
  InboxType,
  InboxStatus,
  EntityType,
  ActivityAction,
} from "../constants/enums";

export * from "./tag";
import type { Tag } from "./tag";

export interface Area {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  status: AreaStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  /** List responses only: non-archived projects, and top-level tasks across direct + those projects. */
  projectCount?: number;
  openTaskCount?: number;
  doneTaskCount?: number;
}

export interface Project {
  id: string;
  userId: string;
  areaId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string | null;
  endDate: string | null;
  coverImage: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  area?: Pick<Area, "id" | "name" | "color" | "icon">;
  totalTasks?: number;
  completedTasks?: number;
}

export interface Task {
  id: string;
  userId: string;
  projectId: string | null;
  areaId: string | null;
  parentTaskId: string | null;
  title: string;
  description: TipTapDocument | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  startDate: string | null;
  tags: Tag[];
  isRecurring: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  subtasks?: Task[];
  workLogs?: WorkLog[];
  project?: Pick<Project, "id" | "name" | "color" | "icon">;
  area?: Pick<Area, "id" | "name" | "color" | "icon">;
  /** Present on list responses; feeds the Kanban card footer. */
  _count?: { resources: number };
}

export interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  body: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  userId: string;
  projects: Pick<Project, "id" | "name" | "color" | "icon">[];
  areas: Pick<Area, "id" | "name" | "color" | "icon">[];
  tasks: Pick<Task, "id" | "title" | "status">[];
  title: string;
  type: ResourceType;
  status: ResourceStatus;
  content: TipTapDocument | null;
  url: string | null;
  icon: string | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  userId: string;
  projectId: string | null;
  areaId: string | null;
  resourceId: string | null;
  title: string;
  content: TipTapDocument | null;
  createdAt: string;
  updatedAt: string;
}

export interface InboxItem {
  id: string;
  userId: string;
  title: string;
  body: TipTapDocument | null;
  type: InboxType;
  status: InboxStatus;
  processedAt: string | null;
  promotedToTaskId: string | null;
  promotedToProjectId: string | null;
  promotedToResourceId: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  entityType: EntityType;
  entityId: string;
  action: ActivityAction;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface KanbanColumn {
  status: TaskStatus;
  tasks: Task[];
}

export interface AreaDashboard {
  projects: Project[];
  tasks: Task[];
  resources: Resource[];
}

export interface SearchResults {
  tasks: Task[];
  projects: Project[];
  areas: Area[];
  resources: Resource[];
}

export interface HQDashboard {
  todayTasks: Task[];
  /** Open tasks due in the next 3 days (after today), soonest first. */
  upcomingTasks: Task[];
  activeProjects: Project[];
  recentResources: Resource[];
  recentActivity: ActivityLogEntry[];
  inboxUnprocessedCount: number;
  activeProjectCount: number;
  /** Tasks created vs completed per week, oldest first; last entry is the current week. */
  weeklyThroughput: { weekStart: string; created: number; completed: number }[];
}
