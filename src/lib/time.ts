const IST = "Asia/Kolkata";

const timeFormat = new Intl.DateTimeFormat("en-IN", { timeZone: IST, hour: "numeric", minute: "2-digit", hour12: true });
const dayFormat = new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short", day: "numeric", month: "short" });

/** "11:00 am" */
export function formatTime(iso: string): string {
  return timeFormat.format(new Date(iso)).replace(/\s?(am|pm)/i, (_, m: string) => ` ${m.toLowerCase()}`);
}

/** "Sat, 24 Oct" */
export function formatDay(iso: string): string {
  return dayFormat.format(new Date(iso));
}

/** 754 -> "12:34". Never negative. */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** "2 hours 5 minutes", "7 minutes", "40 seconds": for the wait before the test opens. */
export function formatWait(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  if (d > 0) return h > 0 ? `${plural(d, "day")} ${plural(h, "hour")}` : plural(d, "day");
  if (h > 0) return m > 0 ? `${plural(h, "hour")} ${plural(m, "minute")}` : plural(h, "hour");
  if (m > 0) return plural(m, "minute");
  return plural(s, "second");
}
