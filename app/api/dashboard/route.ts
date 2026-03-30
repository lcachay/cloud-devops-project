export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getTrafficMetrics } from "@/lib/metrics/traffic";
import { withMetrics } from "@/lib/metrics/wrapper";
import { getCICDMetrics } from "@/lib/metrics/cicd";
import { getPm2Metrics } from "@/lib/metrics/pm2";

export async function GET() {
  return withMetrics(async () => {
    try {
      const [pm2, traffic] = await Promise.all([Promise.resolve(getPm2Metrics()), getTrafficMetrics()]);

      const cicd = getCICDMetrics();
      return NextResponse.json({
        ...cicd,
        ...pm2,
        ...traffic,
      });
    } catch (err) {
      console.error("Error building dashboard metrics:", err);

      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  });
}
