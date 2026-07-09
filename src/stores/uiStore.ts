import { create } from 'zustand';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface UIStoreState {
  sidebarOpen: boolean;
  theme: 'dark';
  notifications: Notification[];
  activeModal: string | null;
  modalData: unknown;
  tooltipVisible: boolean;
  tooltipContent: string;
}

interface UIStoreActions {
  toggleSidebar: () => void;
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
  openModal: (modal: string, data?: unknown) => void;
  closeModal: () => void;
  showTooltip: (content: string) => void;
  hideTooltip: () => void;
}

export const useUIStore = create<UIStoreState & UIStoreActions>()((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  notifications: [],
  activeModal: null,
  modalData: null,
  tooltipVisible: false,
  tooltipContent: '',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, type },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  openModal: (modal, data) =>
    set({ activeModal: modal, modalData: data ?? null }),

  closeModal: () => set({ activeModal: null, modalData: null }),

  showTooltip: (content) => set({ tooltipVisible: true, tooltipContent: content }),

  hideTooltip: () => set({ tooltipVisible: false, tooltipContent: '' }),
}));
