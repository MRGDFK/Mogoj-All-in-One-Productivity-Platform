import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { ProjectDetailSheet } from "@/components/projects/ProjectDetailSheet";
import { ResourceDetailSheet } from "@/components/resources/ResourceDetailSheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 py-4">{children}</main>
      </div>
      <TaskDetailPanel />
      <ProjectDetailSheet />
      <ResourceDetailSheet />
    </div>
  );
}
