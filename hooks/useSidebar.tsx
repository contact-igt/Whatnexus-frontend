// "use client";

// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// interface SidebarStore {
//     isMinimized: boolean;
//     toggle: () => void;
//     setMinimized: (value: boolean) => void;
// }

// export const useSidebar = create<SidebarStore>()(
//     persist(
//         (set) => ({
//             isMinimized: false,
//             toggle: () => set((state) => ({ isMinimized: !state.isMinimized })),
//             setMinimized: (value) => set({ isMinimized: value }),
//         }),
//         {
//             name: "sidebar-storage",
//         }
//     )
// );
