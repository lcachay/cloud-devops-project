import { NextResponse } from "next/server";
import { trackRequest, getTrafficMetrics } from "@/lib/metrics/traffic";
import { getMemoryUsage, getCpuUsage, getUptime } from "@/lib/metrics/system";
import { DashboardMetrics } from "@/lib/metrics/types";

export async function GET() {
  const start = Date.now();

  try {
    const metrics: DashboardMetrics = {
      // CI-CD injected
      appName: "cloud-devops-project",
      environment: process.env.NODE_ENV || "unknown",
      region: process.env.AWS_REGION || "unknown",
      version: process.env.VERSION || "unknown",
      branch: process.env.BRANCH || "unknown",
      buildTime: process.env.BUILD_TIME || "unknown",
      latestCommit: process.env.COMMIT_HASH || "unknown",
      deployTime: process.env.DEPLOY_TIME || "unknown",

      // System
      memoryUsage: getMemoryUsage(),
      cpuUsage: getCpuUsage(),
      uptime: getUptime(),

      // Traffic
      ...getTrafficMetrics(),
    };

    const duration = Date.now() - start;
    trackRequest(duration, false);

    return NextResponse.json(metrics);
  } catch (err) {
    const duration = Date.now() - start;
    trackRequest(duration, true);
    console.error("Error fetching dashboard metrics:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, statusText: "Failed to fetch dashboard metrics" },
    );
  }
}
