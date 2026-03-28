export function getMemoryUsage() {
  const mem = process.memoryUsage();
  return `${(mem.rss / 1024 / 1024).toFixed(2)} MB`;
}

export function getCpuUsage() {
  const usage = process.cpuUsage();
  const total = (usage.user + usage.system) / 1000;
  return `${total.toFixed(2)} ms`;
}

export function getUptime() {
  return `${Math.floor(process.uptime())}s`;
}
