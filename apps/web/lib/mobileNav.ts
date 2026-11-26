export type MobileTab = "home" | "tasks" | "projects" | "more";

export function activeTab(_pathname: string): MobileTab {
  throw new Error("not implemented");
}
