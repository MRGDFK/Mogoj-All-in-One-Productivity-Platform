interface AreaCounts {
  name: string;
  projectCount?: number;
  openTaskCount?: number;
  doneTaskCount?: number;
}

export function summarizeAreas(areas: AreaCounts[]) {
  let projects = 0;
  let openTasks = 0;
  let doneTasks = 0;
  let busiest: { name: string; openTasks: number } | null = null;
  for (const a of areas) {
    const open = a.openTaskCount ?? 0;
    projects += a.projectCount ?? 0;
    openTasks += open;
    doneTasks += a.doneTaskCount ?? 0;
    if (open > 0 && (!busiest || open > busiest.openTasks)) busiest = { name: a.name, openTasks: open };
  }
  return { areas: areas.length, projects, openTasks, doneTasks, busiest };
}
