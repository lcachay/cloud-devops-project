export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { DashboardMetrics, Pm2Metrics } from "@/lib/metrics/types";
import { getTrafficMetrics } from "@/lib/metrics/traffic";

const APP_NAME = process.env.APP_NAME || "unknown";

export async function GET() {
  try {
    const trafficMetrics = await getTrafficMetrics();

    const metrics = {
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

      memory: "unknown",
      cpu: "unknown",
      processStatus: "unknown",
      uptime: "0s",
      restartCount: 0,

      // Traffic
      avgResponseTime: `${trafficMetrics.avgResponseTime}s`,
      errorRate: trafficMetrics.errorRate,
      requestsPerSecond: trafficMetrics.requestsPerSecond,
      totalRequests: trafficMetrics.totalRequests,
      totalErrors: trafficMetrics.totalErrors,

      env: process.env,
    };

    return NextResponse.json(metrics);
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, statusText: "Failed to fetch dashboard metrics" },
    );
  }
}
