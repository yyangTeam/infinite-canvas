import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { useSiteConfig } from "@/hooks/use-site-config";
import { cn } from "@/lib/utils";

type Section = {
    id: string;
    title: string;
    description?: string;
    items?: string[];
    table?: { columns: string[]; rows: string[][] };
    subsections?: { title: string; items: string[]; videoOnly?: boolean }[];
    steps?: string[];
    tip?: string;
    videoOnly?: boolean;
};

const sections: Section[] = [
    {
        id: "getting-started",
        title: "首次使用",
        description: "只需三步即可开始创作。",
        steps: [
            "点击右上角齿轮图标打开配置弹窗。",
            "填入你的 OpenAI 兼容 Base URL、API Key，点击「拉取模型列表」获取可用模型，然后设置默认生图模型和默认文本模型。",
            "关闭配置弹窗，进入「我的画布」新建一个画布项目即可开始创作。",
        ],
        tip: "所有配置和数据都保存在浏览器本地，无需注册账号。如果你使用的接口不支持 /models 端点（如火山方舟 Agent Plan），请手动填写模型名称。",
    },
    {
        id: "api-config",
        title: "API 配置说明",
        description: "项目使用浏览器前台直连你配置的 OpenAI 兼容接口，支持多种 AI 服务。",
        subsections: [
            {
                title: "通用 OpenAI 兼容接口",
                items: [
                    "Base URL：填写你的 API 服务地址，如 https://api.openai.com。如果地址已经以 /v1 结尾，系统不会再追加。",
                    "API Key：填写你的 API 密钥。",
                    "支持的端点：/v1/images/generations（文生图）、/v1/images/edits（图生图/参考图编辑）、/v1/responses（文本问答）、/v1/models（模型列表）。",
                ],
            },
            {
                title: "火山方舟 Seedance 2.0",
                items: [
                    "Base URL 填写 https://ark.cn-beijing.volces.com/api/plan/v3。",
                    "模型名手动填写，如 doubao-seedance-2.0。",
                    "Agent Plan 不支持 /models 端点，配置弹窗中的「拉取模型列表」会返回 404，属于正常现象。",
                ],
            },
            {
                title: "视频生成接口",
                videoOnly: true,
                items: [
                    "OpenAI 风格视频：POST /v1/videos 创建、GET /v1/videos/{id} 查询、GET /v1/videos/{id}/content 获取内容。",
                    "Seedance 2.0 视频：使用 POST /contents/generations/tasks 创建异步任务，系统会自动轮询 GET /contents/generations/tasks/{id} 获取结果。",
                ],
            },
            {
                title: "多渠道配置",
                items: [
                    "配置弹窗支持添加多个 OpenAI 兼容渠道，每个渠道可以设置独立的 Base URL、API Key 和模型。",
                    "可以为不同的创作需求（文本、图片、视频）分别配置不同的渠道和模型。",
                ],
            },
        ],
    },
    {
        id: "canvas",
        title: "画布操作",
        description: "画布是你的核心创作空间，支持无限平移缩放。",
        subsections: [
            {
                title: "视图控制",
                items: [
                    "拖动画布空白区域平移视图。",
                    "鼠标滚轮缩放画布，或使用底部缩放滑杆精确调整。",
                    "点击重置视图按钮回到默认位置和缩放。",
                    "可开启小地图快速定位画布位置。",
                    "支持点阵、网格线、空白三种背景样式，在工具栏切换。",
                    "支持浅色和深色主题。",
                ],
            },
            {
                title: "选择与编辑",
                items: [
                    "点击节点选中，Shift/Ctrl/Cmd + 点击追加或取消选择。",
                    "Ctrl/Cmd + 拖动空白区域框选多个节点。",
                    "Ctrl/Cmd + A 全选所有节点。",
                    "Esc 取消选择并关闭当前浮层。",
                    "Ctrl/Cmd + C 复制选中节点，Ctrl/Cmd + V 粘贴。",
                    "Delete / Backspace 删除选中节点或连线。",
                    "Ctrl/Cmd + Z 撤销，Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y 重做。",
                ],
            },
            {
                title: "节点连线",
                items: [
                    "每个节点左右两侧有连接点，从一个节点的连接点拖拽到另一个节点即可建立连线。",
                    "连线表示上下游关系：上游节点的内容会作为下游节点（如生成配置节点）的输入。",
                    "选中节点时会高亮其相关的上下游节点和连线。",
                    "删除节点时会自动删除该节点相关的所有连线。",
                ],
            },
        ],
    },
    {
        id: "shortcuts",
        title: "快捷键一览",
        table: {
            columns: ["快捷键", "功能"],
            rows: [
                ["拖动空白处", "平移视图"],
                ["鼠标滚轮", "缩放画布"],
                ["Ctrl/Cmd + 拖动", "框选多个节点"],
                ["Shift/Ctrl/Cmd + 点击", "追加或取消选择"],
                ["Ctrl/Cmd + A", "全选节点"],
                ["Esc", "取消选择 / 关闭浮层"],
                ["Ctrl/Cmd + C", "复制节点"],
                ["Ctrl/Cmd + V", "粘贴节点"],
                ["Delete / Backspace", "删除选中节点或连线"],
                ["Ctrl/Cmd + Z", "撤销"],
                ["Ctrl/Cmd + Shift + Z", "重做"],
                ["Ctrl/Cmd + Y", "重做"],
                ["拖入图片文件", "上传图片到画布"],
            ],
        },
    },
    {
        id: "nodes",
        title: "节点详解",
        description: "画布中有五种节点类型，各有不同用途。",
        subsections: [
            {
                title: "图片节点",
                items: [
                    "展示上传图片、AI 生成图片或素材库图片。",
                    "支持拖入图片文件到画布自动创建。",
                    "支持等比缩放或自由比例切换。",
                    "工具栏功能：裁剪、多角度变换（结果生成为新节点）、下载、保存到素材、替换图片。",
                    "支持图片反推提示词功能。",
                    "支持图片放大工具。",
                    "支持图片蒙版局部修改。",
                ],
            },
            {
                title: "文本节点",
                items: [
                    "保存提示词、草稿、说明文案和 AI 生成的文字结果。",
                    "双击内容区域直接编辑文字，或点击工具栏「编辑文字」进入编辑。",
                    "工具栏的「缩小」和「放大」可调整文本字号。",
                    "可作为下游生成配置节点的提示词输入。",
                ],
            },
            {
                title: "生成配置节点",
                items: [
                    "汇总上游文本和图片节点的内容，统一配置后批量生成。",
                    "可配置：生成模式（文本/图片/视频）、模型、图片比例、图片质量、生成数量。",
                    "支持预览当前提示词和参考图输入，可调整输入顺序。",
                    "上游输入通过连线自动读取，无需手动复制粘贴。",
                ],
            },
            {
                title: "视频节点",
                videoOnly: true,
                items: [
                    "展示和播放视频内容，使用原生播放器。",
                    "支持拖入或上传本地视频文件。",
                    "空视频节点下方可输入提示词生成视频。",
                    "Seedance 2.0 支持最多 9 张参考图、3 个参考视频、3 个参考音频。",
                    "支持分辨率 480p/720p/1080p，多种比例和 4-15 秒时长。",
                ],
            },
            {
                title: "音频节点",
                videoOnly: true,
                items: [
                    "支持音频参考输入，可作为视频生成的参考素材。",
                ],
            },
        ],
    },
    {
        id: "image-gen",
        title: "AI 图片生成",
        description: "从文本到图片的完整创作流程。",
        subsections: [
            {
                title: "从文本生成图片",
                items: [
                    "在文本节点中写好提示词内容。",
                    "点击文本节点顶部工具栏的「生图」按钮。",
                    "系统会在右侧自动创建生成配置节点，连接文本节点并立即开始生成。",
                    "后续可在生成配置节点中调整模型、比例、数量后再次生成。",
                ],
            },
            {
                title: "图生图与参考图编辑",
                items: [
                    "已有内容的图片节点可以作为参考图继续生成新图片。",
                    "生成配置节点会自动读取上游图片节点作为参考输入。",
                    "支持图片蒙版局部修改：选择图片特定区域进行局部重绘。",
                ],
            },
            {
                title: "批量生成",
                items: [
                    "生成数量大于 1 时，结果展示为图片组节点。",
                    "图片组支持叠卡预览、展开查看全部结果。",
                    "可以设置主图，方便后续选择最满意的结果。",
                    "生成失败后可以重试。",
                ],
            },
        ],
    },
    {
        id: "text-gen",
        title: "AI 文本生成",
        description: "用 AI 优化和改写文本内容。",
        items: [
            "选中文本节点，点击顶部工具栏「编辑」打开下方对话框。",
            "空文本节点：输入想生成的文本内容，点击发送后结果回填到当前节点。",
            "有内容的文本节点：输入修改指令，改写结果生成到右侧新节点并自动连线，保留原始文本方便对比。",
            "对话框中的模型选择只作用于当前节点，不影响全局设置。",
            "输入内容可以手写，也可以从提示词库选择。",
        ],
    },
    {
        id: "assistant",
        title: "画布助手",
        description: "画布右侧的 AI 对话面板，围绕画布内容进行交互。",
        items: [
            "支持文本问答和生图两种模式。",
            "自动读取当前选中节点作为引用上下文。",
            "自动将选中节点的上游节点也纳入引用，提供更完整的上下文。",
            "可以粘贴图片到助手输入框。",
            "助手生成的文本或图片可以一键插入画布成为新节点。",
            "支持多个历史会话，可删除单条或多条会话。",
            "支持重试回答。",
            "可折叠和展开助手面板。",
        ],
    },
    {
        id: "prompts",
        title: "提示词库",
        description: "浏览来自多个开源项目的 AI 图片提示词，获取创作灵感。",
        items: [
            "提示词来自多个 GitHub 开源项目，由系统自动拉取并缓存。",
            "支持按标题搜索、按标签筛选、按来源筛选。",
            "查看提示词详情，包括封面和结果图预览。",
            "一键复制提示词到剪贴板。",
            "将喜欢的提示词加入「我的素材」收藏。",
        ],
        tip: "提示词数据通过 Next.js 路由拉取 GitHub 仓库并缓存在运行实例内存中，首次加载可能需要等待几秒。",
    },
    {
        id: "assets",
        title: "素材管理",
        description: "「我的素材」是浏览器本地素材库，用于收藏和整理创作资源。",
        items: [
            "支持文本素材和图片素材两种类型。",
            "可从提示词库、画布节点、助手对话中保存素材。",
            "支持编辑素材标题、封面、标签、来源、备注和内容。",
            "支持按关键词搜索和按类型筛选。",
            "支持分页浏览。",
            "文本素材支持一键复制，图片素材支持下载。",
            "在画布中可以快速插入素材作为新节点。",
        ],
    },
    {
        id: "import-export",
        title: "导入导出",
        description: "画布项目支持完整的导入导出功能。",
        items: [
            "单个画布项目可导出为 JSON 文件。",
            "支持从 JSON 文件导入画布项目。",
            "导入导出包含完整的节点、连线和布局信息。",
            "支持批量选择和批量删除画布项目。",
        ],
    },
    {
        id: "storage",
        title: "数据存储与同步",
        description: "了解你的数据存放在哪里，以及如何跨设备同步。",
        items: [
            "画布项目、素材和配置都保存在浏览器本地（IndexedDB），无需后端服务。",
            "图片和视频文件以 Blob 形式存储在浏览器本地，不占用服务器空间。",
            "API Key 保存在浏览器本地，由浏览器直接请求你配置的 API 接口。",
            "如需跨设备同步，可在配置弹窗中填写 WebDAV 服务器地址进行数据同步。",
            "清除浏览器数据会丢失所有本地画布和素材，建议定期通过导出或 WebDAV 备份。",
        ],
    },
    {
        id: "workflow",
        title: "推荐创作流程",
        description: "一个完整的从灵感到成品的工作流程。",
        steps: [
            "新建文本节点，写入你的图片创作想法或简短描述。",
            "选中文本节点，点击「编辑」打开对话框，让 AI 帮你优化或扩写为详细的提示词。",
            "改写结果会生成到右侧新节点并自动连线，原始文本保留方便对比。",
            "确认提示词后，点击工具栏「生图」按钮。",
            "在自动创建的生成配置节点中调整模型、比例、数量等参数。",
            "查看生成结果，满意的图片可保存到素材库，不满意可调整提示词重新生成。",
            "通过连线组织多个节点，构建完整的创作流程图。",
        ],
    },
];

function SectionContent({ section }: { section: Section }) {
    return (
        <section id={section.id} className="scroll-mt-8">
            <h2 className="mb-2 text-lg font-semibold text-stone-800 dark:text-stone-200">{section.title}</h2>
            {section.description ? <p className="mb-4 text-sm text-stone-500">{section.description}</p> : null}

            {section.steps ? (
                <ol className="space-y-2.5">
                    {section.steps.map((step, i) => (
                        <li key={step} className="flex gap-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300">{i + 1}</span>
                            <span>{step}</span>
                        </li>
                    ))}
                </ol>
            ) : null}

            {section.items ? (
                <ul className="space-y-2">
                    {section.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-500" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : null}

            {section.table ? (
                <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/50">
                                {section.table.columns.map((col) => (
                                    <th key={col} className="px-4 py-2.5 text-left font-medium text-stone-700 dark:text-stone-300">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {section.table.rows.map((row) => (
                                <tr key={row[0]} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                                    <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-stone-700 dark:text-stone-300">{row[0]}</td>
                                    <td className="px-4 py-2 text-stone-600 dark:text-stone-400">{row[1]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {section.subsections ? (
                <div className="space-y-5">
                    {section.subsections.map((sub) => (
                        <div key={sub.title}>
                            <h3 className="mb-2.5 text-sm font-medium text-stone-700 dark:text-stone-300">{sub.title}</h3>
                            <ul className="space-y-2">
                                {sub.items.map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-500" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : null}

            {section.tip ? (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                    <span className="mr-1.5 font-medium">提示：</span>{section.tip}
                </div>
            ) : null}
        </section>
    );
}

export default function DocsPage() {
    const enableVideo = useSiteConfig((s) => s.enableVideo);
    const filteredSections = useMemo(() => {
        if (enableVideo) return sections;
        return sections
            .filter((s) => !s.videoOnly)
            .map((s) => ({
                ...s,
                subsections: s.subsections?.filter((sub) => !sub.videoOnly),
            }));
    }, [enableVideo]);
    const [activeId, setActiveId] = useState(filteredSections[0].id);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const handleScroll = () => {
            let current = filteredSections[0].id;
            for (const section of filteredSections) {
                const el = document.getElementById(section.id);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 120) current = section.id;
                }
            }
            setActiveId(current);
        };
        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [filteredSections]);

    const subtitle = enableVideo ? "了解如何使用 ReverseAPI 无限画布进行 AI 图片与视频创作。" : "了解如何使用 ReverseAPI 无限画布进行 AI 图片创作。";

    return (
        <main ref={scrollRef} className="h-full overflow-y-auto">
            <div className="mx-auto flex max-w-6xl gap-10 px-6 py-10">
                <aside className="hidden w-52 shrink-0 lg:block">
                    <div className="sticky top-10">
                        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-stone-900 dark:hover:text-stone-200">
                            <ArrowLeft className="size-3.5" />
                            返回首页
                        </Link>
                        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-400">目录</p>
                        <nav className="flex flex-col gap-0.5">
                            {filteredSections.map((s) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className={cn(
                                        "rounded-md px-2.5 py-1.5 text-[13px] leading-snug transition",
                                        activeId === s.id
                                            ? "bg-stone-100 font-medium text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                                            : "text-stone-500 hover:bg-stone-50 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-stone-800/50 dark:hover:text-stone-200",
                                    )}
                                >
                                    {s.title}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="min-w-0 flex-1">
                    <div className="mb-1 lg:hidden">
                        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-stone-900 dark:hover:text-stone-200">
                            <ArrowLeft className="size-3.5" />
                            返回首页
                        </Link>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">使用指南</h1>
                    <p className="mb-10 text-sm text-stone-500">{subtitle}</p>

                    <div className="space-y-14">
                        {filteredSections.map((section) => (
                            <SectionContent key={section.id} section={section} />
                        ))}
                    </div>

                    <div className="mt-16 border-t border-stone-200 pt-6 text-center text-xs text-stone-400 dark:border-stone-800">
                        如有问题，请联系管理员。
                    </div>
                </div>
            </div>
        </main>
    );
}
