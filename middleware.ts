// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Histogram, Counter, Registry } from "prom-client";

const register = new Registry();

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "pathname"],
});

export const httpErrorsTotal = new Counter({
  name: "http_errors_total",
  help: "Total number of failed HTTP requests",
  labelNames: ["method", "pathname", "status"],
});

export const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "pathname", "status"],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 1, 3],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpErrorsTotal);
register.registerMetric(httpDuration);

export async function middleware(req: NextRequest) {
  const start = process.hrtime.bigint();

  const res = NextResponse.next();

  res.headers.set("x-metrics", "true");

  // to seconds divide by a billion (should be 9 zeros)
  const diff = Number(process.hrtime.bigint() - start) / 1000000000;
  const pathname = req.nextUrl.pathname;

  httpRequestsTotal.labels(req.method, pathname).inc();

  const status = res.status ?? 200;
  if (status >= 400) {
    httpErrorsTotal.labels(req.method, pathname, String(status)).inc();
  }

  httpDuration.labels(req.method, pathname, String(status)).observe(diff);

  return res;
}

export const config = {
  // Routes to run middleware on
  matcher: "/api/:path*",
};
