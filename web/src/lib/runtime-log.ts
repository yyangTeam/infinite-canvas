type RuntimeLogLevel = "error" | "warn";

export type RuntimeLogEntry = { time: number; level: RuntimeLogLevel; source: string; text: string };

const MAX_ENTRIES = 500;
const MAX_TEXT_LENGTH = 4000;
const entries: RuntimeLogEntry[] = [];
const listeners = new Set<() => void>();
let installed = false;

function notify() {
    listeners.forEach((listener) => listener());
}

function push(level: RuntimeLogLevel, source: string, text: string) {
    entries.push({ time: Date.now(), level, source, text: text.slice(0, MAX_TEXT_LENGTH) });
    if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
    notify();
}

function stringifyArg(value: unknown): string {
    if (typeof value === "string") return value;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}

// 采集本次会话的 console 错误/警告与未捕获异常，保留原始 console 行为
export function installRuntimeLogCapture() {
    if (installed) return;
    installed = true;
    const nativeError = console.error.bind(console);
    console.error = (...args: unknown[]) => {
        push("error", "console", args.map(stringifyArg).join(" "));
        nativeError(...args);
    };
    const nativeWarn = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
        push("warn", "console", args.map(stringifyArg).join(" "));
        nativeWarn(...args);
    };
    window.addEventListener("error", (event) => {
        if (event.message) push("error", "window", `${event.message} @ ${event.filename}:${event.lineno}`);
    });
    window.addEventListener("unhandledrejection", (event) => push("error", "promise", stringifyArg(event.reason)));
}

export function getRuntimeLogEntries() {
    return entries;
}

export function subscribeRuntimeLogs(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function clearRuntimeLogs() {
    entries.length = 0;
    notify();
}

function redactSecrets(text: string) {
    return text
        .replace(/sk-[A-Za-z0-9_-]{8,}/g, "sk-***")
        .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{8,}/gi, "Bearer ***")
        .replace(/("(?:api[-_]?key|x-api-key|authorization|token)"\s*:\s*")([^"]{4,})/gi, "$1***");
}

export function buildRuntimeLogText() {
    return entries.map((entry) => `${formatLogTime(entry.time)} [${entry.level}] [${entry.source}] ${redactSecrets(entry.text)}`).join("\n");
}

export function downloadRuntimeLog() {
    const stamp = new Date();
    const blob = new Blob([buildRuntimeLogText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `infinite-canvas-log-${formatStamp(stamp)}.log`;
    link.click();
    URL.revokeObjectURL(url);
}

function formatLogTime(time: number) {
    return new Date(time).toLocaleString("sv-SE", { hour12: false });
}

function formatStamp(date: Date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function pad(value: number) {
    return String(value).padStart(2, "0");
}
