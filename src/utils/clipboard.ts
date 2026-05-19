import { Clip } from "../hooks/useClipboardItems";

export function clipTitle(clip: Clip, maxLen = 80): string {
  if (clip.kind === "image") return "Image";
  const text = clip.text_content ?? "";
  const first = text.split("\n").find((l) => l.trim().length > 0) ?? "";
  return first.length > maxLen ? `${first.slice(0, maxLen)}…` : first;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const mo = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const h = d.getHours().toString().padStart(2, "0");
  const mi = d.getMinutes().toString().padStart(2, "0");
  return `${y}-${mo}-${day} ${h}:${mi}`;
}

export function groupByDay<T extends { updated_at: number }>(items: T[]): {
  today: T[];
  yesterday: T[];
  older: T[];
} {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const today: T[] = [];
  const yesterday: T[] = [];
  const older: T[] = [];
  for (const item of items) {
    if (item.updated_at >= todayStart) today.push(item);
    else if (item.updated_at >= yesterdayStart) yesterday.push(item);
    else older.push(item);
  }
  return { today, yesterday, older };
}
