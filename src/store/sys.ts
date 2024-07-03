import { defineStore } from "pinia";

export type SysStore = ReturnType<typeof useSysStore>;

export const useSysStore = defineStore({
    id: "SYS",
    state: () => ({
        faceCount: 0,
    }),
    getters: {
        getFaceCount(): number {
            return this.faceCount;
        },
    },
    actions: {
      setFaceCount(count: number) {
        this.faceCount = count;
      }
    },
});
