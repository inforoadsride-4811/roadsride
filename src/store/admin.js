import { create } from 'zustand';

const useAdminStore = create((set) => ({
  isDirty: false,
  setDirty: (dirty) => set({ isDirty: dirty }),
}));

export default useAdminStore;
