import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  taskDetailId: string | null;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;

  projectDetailId: string | null;
  openProjectDetail: (projectId: string) => void;
  closeProjectDetail: () => void;

  resourceDetailId: string | null;
  openResourceDetail: (resourceId: string) => void;
  closeResourceDetail: () => void;

  processInboxItemId: string | null;
  openProcessModal: (inboxItemId: string) => void;
  closeProcessModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  taskDetailId: null,
  openTaskDetail: (taskId) => set({ taskDetailId: taskId }),
  closeTaskDetail: () => set({ taskDetailId: null }),

  projectDetailId: null,
  openProjectDetail: (projectId) => set({ projectDetailId: projectId }),
  closeProjectDetail: () => set({ projectDetailId: null }),

  resourceDetailId: null,
  openResourceDetail: (resourceId) => set({ resourceDetailId: resourceId }),
  closeResourceDetail: () => set({ resourceDetailId: null }),

  processInboxItemId: null,
  openProcessModal: (inboxItemId) => set({ processInboxItemId: inboxItemId }),
  closeProcessModal: () => set({ processInboxItemId: null }),
}));
