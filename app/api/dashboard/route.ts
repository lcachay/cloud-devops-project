export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DashboardMetrics } from "@/lib/metrics/types";
import { getTrafficMetrics } from "@/lib/metrics/traffic";
import { withMetrics } from "@/lib/metrics/wrapper";
import { execSync, spawnSync } from "child_process";
const APP_NAME = process.env.APP_NAME || "unknown";

export async function GET() {
  const pm2Data = {
    cpu: 0,
    memory: 0,
    processStatus: "dev",
    uptime: 0,
    restartCount: 0,
  };
  return withMetrics(async () => {
    const result = spawnSync("pm2", ["jlist"], {
      encoding: "utf-8",
    });
    try {
      if (!result.error && result.status === 0) {
        const data = JSON.parse(result.stdout)[0];
        pm2Data.cpu = data.monit?.cpu ?? 0;
        pm2Data.memory = data.monit?.memory ?? 0;
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
        totalMemory: process.env.TOTAL_MEMORY || "unknown",
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
