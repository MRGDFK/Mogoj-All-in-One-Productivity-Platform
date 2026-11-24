import { MotionProvider } from "@/providers/MotionProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { ProjectDetailSheet } from "@/components/projects/ProjectDetailSheet";
import { ResourceDetailSheet } from "@/components/resources/ResourceDetailSheet";
import { QuickCaptureDialog } from "@/components/layout/QuickCaptureDialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Floating chrome: sidebar and header sit inset from the window edges as glass panels
  return (
    <MotionProvider>
    <div className="flex h-screen gap-3 overflow-hidden p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-2 pb-6 pt-3">{children}</main>
      </div>
      <TaskDetailPanel />
      <ProjectDetailSheet />
      <ResourceDetailSheet />
      <QuickCaptureDialog />
    </div>
    </MotionProvider>
  );
}
