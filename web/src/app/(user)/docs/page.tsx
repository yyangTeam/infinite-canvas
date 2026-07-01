"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const sections = [
    {
        title: "首次使用",
        items: [
            "打开右上角配置（齿轮图标），填入你的 OpenAI 兼容 Base URL、API Key 和模型名。",
            "如果使用火山方舟 Agent Plan，Base URL 填写 https://ark.cn-beijing.volces.com/api/plan/v3，模型名手动填写（如 doubao-seedance-2.0）。",
            "配置完成后即可开始创作。所有数据保存在浏览器本地。",
        ],
    },
    {
        title: "画布基础操作",
        items: [
            "拖动空白区域平移画布，滚轮缩放。",
            "Ctrl/Cmd + 拖动框选多个节点，Shift/Ctrl + 点击追加选择。",
            "Ctrl/Cmd + A 全选，Esc 取消选择。",
            "Ctrl/Cmd + C/V 复制粘贴节点，Delete 删除选中节点或连线。",
            "Ctrl/Cmd + Z 撤销，Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y 重做。",
            "支持小地图定位，可在工具栏开关。",
            "支持点阵、网格线、空白三种背景样式。",
        ],
    },
    {
        title: "节点类型",
        items: [
            "图片节点：展示上传图片、AI 生成图片或素材图片。支持拖入图片文件到画布。",
            "文本节点：保存提示词、说明文案、AI 文字回答。双击可编辑内容。",
            "生成配置节点：汇总上游文本和图片，统一配置模型、比例、数量后批量生成。",
            "视频节点：展示和播放视频内容，支持拖入本地视频文件。",
            "音频节点：支持音频参考输入。",
            "所有节点支持拖拽移动、四角缩放、通过连接点建立上下游关系。",
        ],
    },
    {
        title: "AI 图片生成",
        items: [
            "在文本节点中写好提示词，点击顶部工具栏「生图」按钮。",
            "系统会自动创建生成配置节点并开始生成。",
            "支持文生图、图生图、参考图编辑。",
            "批量生成多张图片时会展示为图片组节点，支持叠卡预览和展开查看。",
            "图片节点工具栏支持裁剪、多角度变换、下载、保存到素材。",
        ],
    },
    {
        title: "AI 文本生成",
        items: [
            "选中文本节点，点击工具栏「编辑」打开下方对话框。",
            "空文本节点：输入想生成的内容，结果回填到当前节点。",
            "有内容的文本节点：输入修改指令，改写结果会生成到右侧新节点并自动连线。",
        ],
    },
    {
        title: "视频生成",
        items: [
            "支持 OpenAI 风格视频接口和火山方舟 Seedance 2.0。",
            "可从文本节点读取 prompt，图片节点读取参考图，视频/音频节点读取参考素材。",
            "Seedance 2.0 支持最多 9 张参考图、3 个参考视频、3 个参考音频。",
            "生成成功后视频会插入画布为视频节点，可直接播放预览。",
        ],
    },
    {
        title: "画布助手",
        items: [
            "画布右侧助手面板支持文本问答和生图。",
            "自动读取当前选中节点及其上游节点作为上下文。",
            "可将助手生成的文本或图片直接插入画布。",
            "支持历史会话、删除会话和重试。",
        ],
    },
    {
        title: "提示词库",
        items: [
            "在「提示词库」页面浏览来自多个开源项目的图片提示词。",
            "支持按标题搜索、按标签和来源筛选。",
            "可查看提示词详情、复制提示词、加入我的素材。",
        ],
    },
    {
        title: "素材管理",
        items: [
            "「我的素材」是浏览器本地素材库，支持文本和图片素材。",
            "可从提示词库和画布节点保存素材。",
            "支持编辑标题、封面、标签、来源、备注。",
            "支持按关键词搜索和按类型筛选。",
        ],
    },
    {
        title: "数据同步",
        items: [
            "画布项目和素材默认保存在浏览器本地。",
            "如需跨设备同步，可在配置弹窗中填写 WebDAV 地址进行同步。",
            "API Key 保存在浏览器本地，由浏览器直接请求接口，适合个人使用。",
        ],
    },
    {
        title: "推荐工作流",
        items: [
            "1. 新建文本节点，写入图片创作想法。",
            "2. 用文本节点下方对话框让 AI 优化或扩写提示词。",
            "3. 改写结果会生成到新节点，保留原始文本方便对比。",
            "4. 确认内容后点击工具栏「生图」。",
            "5. 在生成配置节点中调整参数或重新生成。",
        ],
    },
];

export default function DocsPage() {
    return (
        <main className="h-full overflow-y-auto">
            <div className="mx-auto max-w-3xl px-6 py-12">
                <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-stone-500 transition hover:text-stone-900 dark:hover:text-stone-200">
                    <ArrowLeft className="size-4" />
                    返回首页
                </Link>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">使用指南</h1>
                <p className="mb-10 text-stone-500">了解如何使用无限画布进行 AI 图片创作。</p>

                <div className="space-y-10">
                    {sections.map((section) => (
                        <section key={section.title}>
                            <h2 className="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-200">{section.title}</h2>
                            <ul className="space-y-2.5">
                                {section.items.map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-stone-400 dark:bg-stone-500" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                <div className="mt-16 border-t border-stone-200 pt-6 text-center text-xs text-stone-400 dark:border-stone-800">
                    如有问题，请联系管理员。
                </div>
            </div>
        </main>
    );
}
