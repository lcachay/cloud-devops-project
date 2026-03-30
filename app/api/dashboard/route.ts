export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DashboardMetrics } from "@/lib/metrics/types";
import { getTrafficMetrics } from "@/lib/metrics/traffic";
import { withMetrics } from "@/lib/metrics/wrapper";

const APP_NAME = process.env.APP_NAME || "unknown";

export async function GET() {
  return withMetrics(async () => {
    try {
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
        memory: process.env.MEMORY || "unknown",
        totalMemory: process.env.TOTAL_MEMORY || "unknown",
        cpu: process.env.CPU || "unknown",
        processStatus: process.env.PROCESS_STATUS || "unknown",
        uptime: process.env.UPTIME || "0s",
        restartCount: parseInt(process.env.RESTART_COUNT || "0"),

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
