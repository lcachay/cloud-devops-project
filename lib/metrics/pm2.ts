import { spawnSync } from "child_process";

export type Pm2Metrics = {
  cpu: number;
  memory: number;
  totalMemory: string;
  processStatus: string;
  uptime: number;
  restartCount: number;
};

const DEFAULT_PM2: Pm2Metrics = {
  cpu: 0,
  memory: 0,
  totalMemory: "0",
  processStatus: "unknown",
  uptime: 0,
  restartCount: 0,
};
const MOCK_PM2: Pm2Metrics = {
  cpu: 0.2,
  memory: 80855040,
  totalMemory: "938836",
  processStatus: "online",
  uptime: 1774835543790,
  restartCount: 0,
};

export function getPm2Metrics(): Pm2Metrics {
  const pm2 = spawnSync("pm2", ["jlist"], { encoding: "utf-8" });
  const mem = spawnSync("sh", ["-c", "grep MemTotal /proc/meminfo | awk '{print $2}'"], {
    encoding: "utf-8",
  });

  if (pm2.error || pm2.status !== 0 || mem.error || mem.status !== 0) {
    // We're probably running local without PM2, so return mock data
    return MOCK_PM2;
  }

  try {
    const parsed = JSON.parse(pm2.stdout)[0];

    return {
      cpu: parsed?.monit?.cpu ?? 0,
      memory: parsed?.monit?.memory ?? 0,
      totalMemory: mem.stdout.trim() || "0",
      processStatus: parsed?.pm2_env?.status ?? "unknown",
      uptime: parsed?.pm2_env?.pm_uptime ?? 0,
      restartCount: parsed?.pm2_env?.restart_time ?? 0,
    };
  } catch {
    return DEFAULT_PM2;
  }
}
