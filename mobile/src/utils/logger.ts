type LogLevel = "debug" | "info" | "warn" | "error";
type LogColor = "cyan" | "green" | "yellow" | "blue" | "magenta" | "red" | "gray";

interface LoggerOptions {
  level?: LogLevel;
  color?: LogColor;
}

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface ColorSpec {
  ansi: string;
  css: string;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const IS_DEV =
  typeof __DEV__ !== "undefined"
    ? __DEV__
    : typeof process !== "undefined"
      ? process.env.NODE_ENV !== "production"
      : true;
const DEFAULT_LEVEL: LogLevel = IS_DEV ? "debug" : "error";
const IS_BROWSER = typeof window !== "undefined" && typeof document !== "undefined";
const RESET = "\x1b[0m";

const COLORS: Record<LogColor, ColorSpec> = {
  cyan: { ansi: "\x1b[36m", css: "#06b6d4" },
  green: { ansi: "\x1b[32m", css: "#22c55e" },
  yellow: { ansi: "\x1b[33m", css: "#eab308" },
  blue: { ansi: "\x1b[34m", css: "#3b82f6" },
  magenta: { ansi: "\x1b[35m", css: "#a855f7" },
  red: { ansi: "\x1b[31m", css: "#ef4444" },
  gray: { ansi: "\x1b[90m", css: "#94a3b8" },
};

const COLOR_LIST = [
  COLORS.cyan,
  COLORS.green,
  COLORS.yellow,
  COLORS.blue,
  COLORS.magenta,
  COLORS.red,
  COLORS.gray,
];

const moduleColors = new Map<string, ColorSpec>();

const MAX_DEPTH = 2;
const MAX_ARRAY_ITEMS = 8;
const MAX_OBJECT_KEYS = 12;
const MAX_STRING_LENGTH = 200;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getColorForModule(moduleName: string): ColorSpec {
  const key = moduleName.toLowerCase();
  const cached = moduleColors.get(key);
  if (cached) return cached;

  const color = COLOR_LIST[hashString(key) % COLOR_LIST.length];
  moduleColors.set(key, color);
  return color;
}

function formatValue(value: unknown, depth: number, seen: Set<unknown>): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (typeof value === "string") {
    const trimmed = value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}...` : value;
    return trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (typeof value === "symbol") return value.toString();
  if (typeof value === "function") return "[Function]";

  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    const message = value.message ? `${value.name}: ${value.message}` : value.name;
    if (IS_DEV && value.stack) {
      const stackLine = value.stack.split("\n").slice(1, 2).map((line) => line.trim()).join(" ");
      return stackLine ? `${message} (${stackLine})` : message;
    }
    return message;
  }

  if (typeof value === "object") {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);

    if (Array.isArray(value)) {
      if (depth >= MAX_DEPTH) return `[Array(${value.length})]`;
      const items = value.slice(0, MAX_ARRAY_ITEMS).map((item) => formatValue(item, depth + 1, seen));
      const suffix = value.length > MAX_ARRAY_ITEMS ? ", ..." : "";
      return `[${items.join(", ")}${suffix}]`;
    }

    if (depth >= MAX_DEPTH) return "[Object]";

    const entries = Object.entries(value as Record<string, unknown>);
    const pairs = entries.slice(0, MAX_OBJECT_KEYS).map(([key, entryValue]) => {
      return `${key}: ${formatValue(entryValue, depth + 1, seen)}`;
    });
    const suffix = entries.length > MAX_OBJECT_KEYS ? ", ..." : "";
    return `{ ${pairs.join(", ")}${suffix} }`;
  }

  return String(value);
}

function formatArgs(args: unknown[]): string {
  if (args.length === 0) return "";
  return args.map((arg) => formatValue(arg, 0, new Set<unknown>())).join(" ");
}

function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[minLevel];
}

function writeLog(
  level: LogLevel,
  moduleLabel: string,
  color: ColorSpec,
  minLevel: LogLevel,
  args: unknown[]
): void {
  if (!shouldLog(level, minLevel)) return;

  const prefix = `[${moduleLabel}]`;
  const message = formatArgs(args);
  const method = level === "error" ? "error" : level === "warn" ? "warn" : "log";

  if (IS_BROWSER) {
    const label = `%c${prefix}%c${message ? " " : ""}${message}`;
    console[method](label, `color: ${color.css}; font-weight: 600`, "color: inherit");
    return;
  }

  const line = `${color.ansi}${prefix}${RESET}${message ? " " : ""}${message}`;
  console[method](line);
}

export function createLogger(moduleName: string, options: LoggerOptions = {}): Logger {
  const moduleLabel = moduleName.trim() ? moduleName.toUpperCase() : "APP";
  const minLevel = options.level ?? DEFAULT_LEVEL;
  const color = options.color ? COLORS[options.color] : getColorForModule(moduleLabel);

  return {
    debug: (...args) => writeLog("debug", moduleLabel, color, minLevel, args),
    info: (...args) => writeLog("info", moduleLabel, color, minLevel, args),
    warn: (...args) => writeLog("warn", moduleLabel, color, minLevel, args),
    error: (...args) => writeLog("error", moduleLabel, color, minLevel, args),
  };
}
