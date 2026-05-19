// Map a Tauri accelerator string like "CommandOrControl+Space" to display symbols.
const SYMBOL_MAP: Record<string, string> = {
  Command: "⌘",
  CommandOrControl: "⌘",
  Cmd: "⌘",
  Super: "⌘",
  Meta: "⌘",
  Alt: "⌥",
  Option: "⌥",
  Control: "⌃",
  Ctrl: "⌃",
  Shift: "⇧",
};

const KEY_LABEL: Record<string, string> = {
  Space: "Space",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Enter: "↵",
  Escape: "esc",
  Backspace: "⌫",
  Tab: "⇥",
};

export function formatAccelerator(acc: string): string[] {
  if (!acc) return [];
  return acc.split("+").map((p) => SYMBOL_MAP[p] ?? KEY_LABEL[p] ?? p.toUpperCase());
}

const MODIFIER_KEYS = new Set([
  "Meta",
  "Control",
  "Alt",
  "Shift",
  "Command",
  "Option",
  "OS",
  "AltGraph",
]);

// Map a KeyboardEvent.code to a Tauri-compatible token.
// We use `code` (physical key) instead of `key` (logical character) so that
// ⌥C on macOS — which the system rewrites to "ç" — still parses as "C".
function codeToToken(code: string, key: string): string | null {
  // Letter keys: "KeyA" → "A"
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  // Number row: "Digit5" → "5"
  if (/^Digit\d$/.test(code)) return code.slice(5);
  // Numpad digits
  if (/^Numpad\d$/.test(code)) return code;
  // Function keys
  if (/^F\d{1,2}$/.test(code)) return code;
  // Arrows
  if (code.startsWith("Arrow")) return code;

  // Named keys
  switch (code) {
    case "Space":
      return "Space";
    case "Enter":
    case "NumpadEnter":
      return "Enter";
    case "Tab":
      return "Tab";
    case "Escape":
      return "Escape";
    case "Backspace":
      return "Backspace";
    case "Delete":
      return "Delete";
    case "Home":
    case "End":
    case "PageUp":
    case "PageDown":
      return code;
    case "Minus":
      return "-";
    case "Equal":
      return "=";
    case "BracketLeft":
      return "[";
    case "BracketRight":
      return "]";
    case "Backslash":
      return "\\";
    case "Semicolon":
      return ";";
    case "Quote":
      return "'";
    case "Comma":
      return ",";
    case "Period":
      return ".";
    case "Slash":
      return "/";
    case "Backquote":
      return "`";
  }

  // Fallback to key value for anything we didn't recognise
  if (key.length === 1) return key.toUpperCase();
  return null;
}

// Convert a keyboard event to a Tauri accelerator string. Requires at least one modifier.
export function eventToAccelerator(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;

  const parts: string[] = [];
  if (e.metaKey) parts.push("CommandOrControl");
  if (e.ctrlKey && !e.metaKey) parts.push("Control");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");

  if (parts.length === 0) return null;

  const token = codeToToken(e.code, e.key);
  if (!token) return null;

  parts.push(token);
  return parts.join("+");
}

export const DEFAULT_ACCELERATOR = "Alt+Space";
