export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DashboardMetrics } from "@/lib/metrics/types";
import { getTrafficMetrics } from "@/lib/metrics/traffic";
import { withMetrics } from "@/lib/metrics/wrapper";
import { spawnSync } from "child_process";
const APP_NAME = process.env.APP_NAME || "unknown";

export async function GET() {
  const pm2Data = {
    cpu: 0.2,
    memory: 80855040,
    totalMemory: "938836",
    processStatus: "online",
    uptime: 1774835543790,
    restartCount: 0,
  };
  return withMetrics(async () => {
    const resultPm2 = spawnSync("pm2", ["jlist"], {
      encoding: "utf-8",
    });
    const resultMem = spawnSync("sh", ["-c", "grep MemTotal /proc/meminfo | awk '{print $2}'"], {
      encoding: "utf-8",
    });
    try {
      if (!resultPm2.error && resultPm2.status === 0 && resultMem.status === 0 && !resultMem.error) {
        const data = JSON.parse(resultPm2.stdout)[0];
        pm2Data.cpu = data.monit?.cpu ?? 0;
        pm2Data.memory = data.monit?.memory ?? 0;
        pm2Data.totalMemory = resultMem.stdout.trim() || "0";
        pm2Data.processStatus = data.pm2_env?.status ?? "unknown";
        pm2Data.uptime = data.pm2_env?.pm_uptime ?? 0;
        pm2Data.restartCount = data.pm2_env?.restart_time ?? 0;
      }
      const trafficMetrics = await getTrafficMetrics();

      const metrics: DashboardMetrics = {
        // CI/CD injected
        appName: APP_NAME,
        environment: process.env.ENVIRONMENT || "unknown",
        region: process.env.AWS_REGION || "unknown",
        version: process.env.VERSION || "unknown",
        branch: process.env.BRANCH || "unknown",
        buildTime: process.env.BUILD_TIME || "unknown",
        latestCommit: process.env.COMMIT_HASH || "unknown",
        deployTime: process.env.DEPLOY_TIME || "unknown",
        deployStatus: process.env.DEPLOY_STATUS || "unknown",

        // PM2 injected
        memory: pm2Data.memory.toString(),
        totalMemory: pm2Data.totalMemory,
        cpu: pm2Data.cpu.toString(),
        processStatus: pm2Data.processStatus,
        uptime: pm2Data.uptime.toString(),
        restartCount: pm2Data.restartCount,

        // Traffic
        avgResponseTime: `${trafficMetrics.avgResponseTime}ms`,
        errorRate: trafficMetrics.errorRate,
        requestsPerSecond: trafficMetrics.requestsPerSecond,
        totalRequests: trafficMetrics.totalRequests,
        totalErrors: trafficMetrics.totalErrors,
      };

      return NextResponse.json(metrics);
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500, statusText: "Failed to fetch dashboard metrics" },
      );
    }
  });
}
