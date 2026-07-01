import { create } from "zustand";

export type SiteConfig = {
    fixedBaseUrl: string;
    enableVideo: boolean;
};

const defaults: SiteConfig = {
    fixedBaseUrl: "",
    enableVideo: false,
};

type SiteConfigStore = SiteConfig & {
    loaded: boolean;
    load: () => Promise<void>;
};

export const useSiteConfig = create<SiteConfigStore>((set, get) => ({
    ...defaults,
    loaded: false,
    load: async () => {
        if (get().loaded) return;
        try {
            const res = await fetch("/config.json", { cache: "no-store" });
            if (res.ok) {
                const json = await res.json();
                set({
                    fixedBaseUrl: typeof json.fixedBaseUrl === "string" ? json.fixedBaseUrl : defaults.fixedBaseUrl,
                    enableVideo: typeof json.enableVideo === "boolean" ? json.enableVideo : defaults.enableVideo,
                    loaded: true,
                });
                return;
            }
        } catch {}
        set({ loaded: true });
    },
}));
