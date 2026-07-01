import { FileText, ImagePlus, Images, Maximize2, Video } from "lucide-react";
import { ENABLE_VIDEO } from "@/constant/env";

const allNavigationTools = [
    {
        slug: "canvas",
        label: "我的画布",
        icon: Maximize2,
    },
    {
        slug: "image",
        label: "生图工作台",
        icon: ImagePlus,
    },
    {
        slug: "video",
        label: "视频创作台",
        icon: Video,
        requiresVideo: true,
    },
    {
        slug: "prompts",
        label: "提示词库",
        icon: FileText,
    },
    {
        slug: "assets",
        label: "我的素材",
        icon: Images,
    },
] as const;

export const navigationTools = allNavigationTools.filter((t) => !("requiresVideo" in t && t.requiresVideo) || ENABLE_VIDEO);

export type NavigationToolSlug = (typeof allNavigationTools)[number]["slug"];
