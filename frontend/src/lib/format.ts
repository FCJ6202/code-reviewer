const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = (n: number) => String(n).padStart(2, '0');

/** "13 Sep" */
export function formatDayMonth(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "13 Sep, 04:30" (local time) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatDayMonth(iso)}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "13 Sep 2026" */
export function formatDate(iso: string): string {
  return `${formatDayMonth(iso)} ${new Date(iso).getFullYear()}`;
}

/** "11.0 s" */
export function formatLatency(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

/** "138 B", "12.4 KB" */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** "Vishal Rajak" → "VR" */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
