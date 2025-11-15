import { create } from "zustand";

type ProviderConfig = { label: string; baseURL: string };
type JobEntry = {
  id: string;
  provider: string;
  events: { t: number; label: string; data?: unknown }[];
  status?: { state: string; cid?: string; hash?: string };
};

type State = {
  providers: ProviderConfig[];
  selected: number;
  job?: JobEntry;
  setSelected: (i: number) => void;
  setProviders: (p: ProviderConfig[]) => void;
  startJob: (job: JobEntry) => void;
  pushEvent: (label: string, data?: unknown) => void;
  setStatus: (s: JobEntry["status"]) => void;
  reset: () => void;
};

export const useApp = create<State>((set, get) => ({
  providers: [
    { label: "Research (7001)", baseURL: "/api/mcp?provider=7001" },
    { label: "FrameGen (7002)", baseURL: "/api/mcp?provider=7002" }
  ],
  selected: 0,
  setSelected: (i) => set({ selected: i }),
  setProviders: (p) => set({ providers: p }),
  startJob: (job) => set({ job }),
  pushEvent: (label, data) => {
    const j = get().job;
    if (!j) return;
    j.events.push({ t: Date.now(), label, data });
    set({ job: { ...j } });
  },
  setStatus: (s) => {
    const j = get().job;
    if (!j) return;
    set({ job: { ...j, status: s } });
  },
  reset: () => set({ job: undefined })
}));
