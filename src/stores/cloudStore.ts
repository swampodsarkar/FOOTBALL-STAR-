import { create } from 'zustand';

export type CloudStatus = 'loading' | 'guest' | 'connected' | 'error';

interface CloudState {
  status: CloudStatus;
  uid: string | null;
  email: string | null;
  initialized: boolean;
  setStatus: (status: CloudStatus) => void;
  setUid: (uid: string | null) => void;
  setEmail: (email: string | null) => void;
  setInitialized: (v: boolean) => void;
}

export const useCloudStore = create<CloudState>((set) => ({
  status: 'loading',
  uid: null,
  email: null,
  initialized: false,
  setStatus: (status) => set({ status }),
  setUid: (uid) => set({ uid }),
  setEmail: (email) => set({ email }),
  setInitialized: (v) => set({ initialized: v }),
}));
