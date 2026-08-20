import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  taskDetailId: string | null;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;

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

  processInboxItemId: null,
  openProcessModal: (inboxItemId) => set({ processInboxItemId: inboxItemId }),
  closeProcessModal: () => set({ processInboxItemId: null }),
}));
