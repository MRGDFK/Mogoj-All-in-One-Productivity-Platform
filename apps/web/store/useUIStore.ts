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

  quickCaptureOpen: boolean;
  setQuickCaptureOpen: (open: boolean) => void;

  // App-wide create dialogs, opened from the + menus (bottom bar, sidebar, Quick Capture)
  createDialog: "task" | "project" | "resource" | null;
  setCreateDialog: (dialog: "task" | "project" | "resource" | null) => void;

  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;

  processInboxItemId: string | null;
  openProcessModal: (inboxItemId: string) => void;
  closeProcessModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Mobile nav drawer (below lg). The desktop sidebar is always shown.
  sidebarOpen: false,
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

  quickCaptureOpen: false,
  setQuickCaptureOpen: (open) => set({ quickCaptureOpen: open }),

  createDialog: null,
  setCreateDialog: (dialog) => set({ createDialog: dialog }),

  paletteOpen: false,
  setPaletteOpen: (open) => set({ paletteOpen: open }),

  processInboxItemId: null,
  openProcessModal: (inboxItemId) => set({ processInboxItemId: inboxItemId }),
  closeProcessModal: () => set({ processInboxItemId: null }),
}));
