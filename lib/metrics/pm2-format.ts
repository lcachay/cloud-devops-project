import { Duration } from "luxon";

export function formatUptime(pmUptimeMs: number): string {
  const duration = Duration.fromMillis(Date.now() - pmUptimeMs).shiftTo("days", "hours", "minutes", "seconds");

  const parts = [];
  if (duration.days > 0) parts.push(`${Math.floor(duration.days)}d`);
  if (duration.hours > 0) parts.push(`${Math.floor(duration.hours)}h`);
  if (duration.minutes > 0) parts.push(`${Math.floor(duration.minutes)}m`);
  if (duration.seconds > 0 && parts.length === 0) parts.push(`${Math.floor(duration.seconds)}s`);

  return parts.join(" ");
}
