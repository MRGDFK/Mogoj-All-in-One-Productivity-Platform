export type MobileTab = "home" | "tasks" | "projects" | "more";

const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/** Which bottom-bar tab a route belongs to; pages without their own tab live under More. */
export function activeTab(pathname: string): MobileTab {
  if (pathname === "/") return "home";
  if (under(pathname, "/tasks")) return "tasks";
  if (under(pathname, "/projects")) return "projects";
  return "more";
}
