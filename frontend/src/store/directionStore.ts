import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DirectionState {
  isRtl: boolean;
  toggleDirection: () => void;
}

export const useDirectionStore = create<DirectionState>()(
  persist(
    (set) => ({
      isRtl: true,
      toggleDirection: () => set((state) => ({ isRtl: !state.isRtl })),
    }),
    {
      name: "mad-tech-direction",
    }
  )
);
