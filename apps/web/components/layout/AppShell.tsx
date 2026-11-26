import { MotionProvider } from "@/providers/MotionProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { TaskDetailPanel } from "@/components/tasks/TaskDetailPanel";
import { ProjectDetailSheet } from "@/components/projects/ProjectDetailSheet";
import { ResourceDetailSheet } from "@/components/resources/ResourceDetailSheet";
import { QuickCaptureDialog } from "@/components/layout/QuickCaptureDialog";
import { QuickCaptureFab } from "@/components/layout/QuickCaptureFab";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Floating chrome: sidebar and header sit inset from the window edges as glass panels
  return (
    <MotionProvider>
    <div className="flex h-dvh gap-2 overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] pt-[max(0.5rem,env(safe-area-inset-top))] lg:gap-3 lg:p-3">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden lg:gap-3">
        <Header />
        <main className="flex-1 overflow-y-auto px-1 pb-6 pt-3 sm:px-2 pointer-coarse:pb-24">{children}</main>
      </div>
      <TaskDetailPanel />
      <ProjectDetailSheet />
      <ResourceDetailSheet />
      <QuickCaptureDialog />
      <QuickCaptureFab />
    </div>
    </MotionProvider>
  );
}
