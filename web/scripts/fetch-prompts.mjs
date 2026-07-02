#!/usr/bin/env node

/**
 * Fetches prompt data from 6 GitHub repositories and saves to src/data/prompts-data.json.
 * Run: node scripts/fetch-prompts.mjs
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../src/data/prompts-data.json");

const gptImage2RawBase = "https://raw.githubusercontent.com/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts/main";
const awesomeGptImageRawBase = "https://raw.githubusercontent.com/ZeroLu/awesome-gpt-image/main";
const awesomeGpt4oImagePromptsBase = "https://raw.githubusercontent.com/ImgEdify/Awesome-GPT4o-Image-Prompts/main";
const youMindGptImage2RawBase = "https://raw.githubusercontent.com/YouMind-OpenLab/awesome-gpt-image-2/main";
const youMindNanoBananaProRawBase = "https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main";
const davidWuGptImage2RawBase = "https://raw.githubusercontent.com/davidwuw0811-boop/awesome-gpt-image2-prompts/main";
const gptImage2CaseFiles = ["README.md", "cases/ad-creative.md", "cases/character.md", "cases/comparison.md", "cases/ecommerce.md", "cases/portrait.md", "cases/poster.md", "cases/ui.md"];

const categories = [
    { category: "gpt-image-2-prompts", githubUrl: "https://github.com/EvoLinkAI/awesome-gpt-image-2-API-and-Prompts", build: buildGptImage2Prompts },
    { category: "awesome-gpt-image", githubUrl: "https://github.com/ZeroLu/awesome-gpt-image", build: buildAwesomeGptImagePrompts },
    { category: "awesome-gpt4o-image-prompts", githubUrl: "https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts", build: buildAwesomeGpt4oImagePrompts },
    { category: "youmind-gpt-image-2", githubUrl: "https://github.com/YouMind-OpenLab/awesome-gpt-image-2", build: () => buildYouMindPrompts(youMindGptImage2RawBase, "youmind-gpt-image-2", "gpt-image-2") },
    { category: "youmind-nano-banana-pro", githubUrl: "https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts", build: () => buildYouMindPrompts(youMindNanoBananaProRawBase, "youmind-nano-banana-pro", "nano-banana-pro") },
    { category: "davidwu-gpt-image2-prompts", githubUrl: "https://github.com/davidwuw0811-boop/awesome-gpt-image2-prompts", build: buildDavidWuGptImage2Prompts },
];

const GITHUB_IMAGE_PROXY = "https://ghfast.top/";
const PROXIED_DOMAINS = ["https://raw.githubusercontent.com/", "https://pbs.twimg.com/"];

function proxyImageUrl(url) {
    if (!url) return url;
    for (const domain of PROXIED_DOMAINS) {
        if (url.startsWith(domain)) return GITHUB_IMAGE_PROXY + url;
    }
    return url;
}

function proxyPromptUrls(item) {
    return {
        ...item,
        coverUrl: proxyImageUrl(item.coverUrl),
        preview: item.preview.replace(/!\[([^\]]*)]\((https:\/\/(?:raw\.githubusercontent\.com|pbs\.twimg\.com)[^)]+)\)/g, (_, alt, url) => `![${alt}](${proxyImageUrl(url)})`),
    };
}

async function main() {
    console.log("Fetching prompts from GitHub repositories...");
    const settled = await Promise.all(
        categories.map(async (cat) => {
            try {
                console.log(`  Fetching: ${cat.category}`);
                const items = await cat.build();
                console.log(`  Done: ${cat.category} (${items.length} prompts)`);
                return items.map((item) => ({ ...item, category: cat.category, githubUrl: cat.githubUrl }));
            } catch (err) {
                console.error(`  Failed: ${cat.category} - ${err.message}`);
                return [];
            }
        }),
    );
    const items = settled.flat().map(proxyPromptUrls);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, JSON.stringify(items, null, 2));
    console.log(`\nSaved ${items.length} prompts to ${outputPath}`);
}

async function fetchText(baseUrl, file) {
    const url = `${baseUrl}/${file}`;
    const proxyUrl = url.startsWith("https://raw.githubusercontent.com/") ? GITHUB_IMAGE_PROXY + url : url;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error(`${file} fetch failed (${response.status})`);
    return response.text();
}

async function fetchJson(baseUrl, file) {
    return JSON.parse(await fetchText(baseUrl, file));
}

async function buildGptImage2Prompts() {
    const data = (await fetchJson(gptImage2RawBase, "data/ingested_tweets.json")).records || [];
    const cases = new Map();
    const markdowns = await Promise.all(gptImage2CaseFiles.map((file) => fetchText(gptImage2RawBase, file)));
    markdowns.forEach((markdown) => collectGptImage2Cases(cases, markdown));
    const items = [];
    data.forEach((item) => {
        const prompt = cases.get(item.tweet_url || "");
        if (!item.title || !prompt || !item.image_dir) return;
        const image = `${gptImage2RawBase}/${item.image_dir}/output.jpg`;
        items.push({ id: `gpt-image-2-prompts-${leftPad(items.length + 1)}`, title: item.title, coverUrl: image, prompt, tags: tagsFromCategory(item.category || ""), preview: markdownPreview([image]), createdAt: item.added_at || "", updatedAt: item.added_at || "" });
    });
    return items;
}

function collectGptImage2Cases(cases, markdown) {
    for (const match of markdown.matchAll(/### Case \d+: \[[^\]]+]\(([^)]+)\).*?\*\*Prompt:\*\*\s*\r?\n\s*```[\w-]*\r?\n(.*?)\r?\n```/gs)) {
        cases.set(match[1], match[2].trim());
    }
}

async function buildAwesomeGptImagePrompts() {
    const markdown = await fetchText(awesomeGptImageRawBase, "README.zh-CN.md");
    const items = [];
    for (const section of splitBeforeHeading(markdown, "## ")) {
        const tags = tagsFromHeading(firstMatch(section, /^##\s+(.+)$/m));
        for (const block of splitBeforeHeading(section, "### ")) {
            const title = firstMatch(block, /^###\s+(.+)$/m).replace(/\[([^\]]+)]\([^)]+\)/g, "$1").trim();
            const prompt = firstMatch(block, /\*\*提示词:\*\*\s*\r?\n\s*```[\w-]*\r?\n(.*?)\r?\n```/s).trim();
            if (!title || !prompt) continue;
            const images = extractMarkdownImages(awesomeGptImageRawBase, block);
            items.push(defaultPrompt(`awesome-gpt-image-${leftPad(items.length + 1)}`, title, prompt, images[0] || "", tags, markdownPreview(images)));
        }
    }
    return items;
}

async function buildAwesomeGpt4oImagePrompts() {
    const markdown = await fetchText(awesomeGpt4oImagePromptsBase, "README.zh-CN.md");
    const items = [];
    for (const block of splitBeforeHeading(markdown, "### ")) {
        const title = firstMatch(block, /^###\s+(.+)$/m).trim();
        const prompt = firstMatch(block, /- \*\*提示词文本：\*\*\s*`(.*?)`/s).trim();
        if (!title || !prompt) continue;
        const images = extractMarkdownImages(awesomeGpt4oImagePromptsBase, block);
        items.push(defaultPrompt(`awesome-gpt4o-image-prompts-${leftPad(items.length + 1)}`, title, prompt, images[0] || "", ["gpt4o"], markdownPreview(images)));
    }
    return items;
}

async function buildYouMindPrompts(baseUrl, idPrefix, modelTag) {
    const markdown = await fetchText(baseUrl, "README_zh.md");
    const items = [];
    for (const block of splitBeforeHeading(markdown, "### ")) {
        const title = firstMatch(block, /^###\s+No\.\s*\d+:\s*(.+)$/m).trim();
        const prompt = firstMatch(block, /#### .*?提示词\s*\r?\n\s*```[\w-]*\r?\n(.*?)\r?\n```/s).trim();
        if (!title || !prompt) continue;
        const images = extractMarkdownImages(baseUrl, block);
        items.push(defaultPrompt(`${idPrefix}-${leftPad(items.length + 1)}`, title, prompt, images[0] || "", youMindTags(title, modelTag), markdownPreview(images)));
    }
    return items;
}

async function buildDavidWuGptImage2Prompts() {
    const data = await fetchJson(davidWuGptImage2RawBase, "prompts.json");
    return data
        .map((item, index) => {
            const title = (item.title_cn || item.title_en || "").trim();
            const prompt = (item.prompt || "").trim();
            if (!title || !prompt) return null;
            const image = absoluteImage(davidWuGptImage2RawBase, item.image || "");
            const preview = [item.title_en, item.note, image ? `![](${image})` : ""].filter(Boolean).join("\n\n");
            return defaultPrompt(`davidwu-gpt-image2-prompts-${leftPad(item.id || index + 1)}`, title, prompt, image, davidWuTags(item), preview);
        })
        .filter(Boolean);
}

function defaultPrompt(id, title, prompt, coverUrl, tags, preview) {
    return { id, title, coverUrl, prompt, tags, preview, createdAt: "", updatedAt: "" };
}

function splitBeforeHeading(markdown, prefix) {
    const blocks = [];
    let current = [];
    for (const line of markdown.split("\n")) {
        if (line.startsWith(prefix) && current.length) {
            blocks.push(current.join("\n"));
            current = [];
        }
        current.push(line);
    }
    blocks.push(current.join("\n"));
    return blocks;
}

function firstMatch(value, pattern) {
    return pattern.exec(value)?.[1] || "";
}

function extractMarkdownImages(baseUrl, markdown) {
    return Array.from(markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g), (match) => absoluteImage(baseUrl, match[1])).filter(Boolean);
}

function absoluteImage(baseUrl, image) {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    return `${baseUrl}/${image.replace(/^\.?\//, "")}`;
}

function tagsFromCategory(category) {
    return splitTags(category.replace(/\s+Cases$/i, ""), /\s*(?:&|and)\s*/);
}

function tagsFromHeading(heading) {
    return splitTags(heading.replace(/[^\p{L}\p{N}/&、与 ]/gu, ""), /\s*(?:\/|&|、|与)\s*/);
}

function youMindTags(title, modelTag) {
    const [, prefix] = title.match(/^(.+?) - /) || [];
    return [modelTag, ...tagsFromHeading(prefix || "")];
}

function davidWuTags(item) {
    const tags = splitTags([item.category_cn, item.category, item.author, item.source].filter(Boolean).join("/"), /\//);
    if (item.needs_ref) tags.push("需要参考图");
    return tags;
}

function splitTags(value, pattern) {
    return value.split(pattern).map((tag) => tag.trim().toLowerCase()).filter(Boolean);
}

function markdownPreview(images) {
    return images.filter(Boolean).map((image) => `![](${image})`).join("\n\n");
}

function leftPad(value) {
    return String(value).padStart(4, "0");
}

main().catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
});
