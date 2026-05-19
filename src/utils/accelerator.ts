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
]);

// Convert a keyboard event to a Tauri accelerator string. Requires at least one modifier.
export function eventToAccelerator(e: KeyboardEvent): string | null {
  const parts: string[] = [];
  if (e.metaKey) parts.push("CommandOrControl");
  if (e.ctrlKey && !e.metaKey) parts.push("Control");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");

  if (parts.length === 0) return null;

  const key = e.key;
  if (MODIFIER_KEYS.has(key)) return null;

  let token: string;
  if (key === " ") token = "Space";
  else if (key.length === 1) token = key.toUpperCase();
  else if (key.startsWith("Arrow")) token = key;
  else if (/^F\d{1,2}$/.test(key)) token = key;
  else token = key.charAt(0).toUpperCase() + key.slice(1);

  parts.push(token);
  return parts.join("+");
}

export const DEFAULT_ACCELERATOR = "Alt+Space";
