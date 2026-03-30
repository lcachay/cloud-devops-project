import client from "prom-client";

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
});

export const httpErrorsTotal = new client.Counter({
  name: "http_errors_total",
  help: "Total HTTP errors",
});

export const httpDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration",
});

export async function getTrafficMetrics() {
  const requestsMetric = await httpRequestsTotal.get();
  const errorsMetric = await httpErrorsTotal.get();
  const durationMetric = await httpDuration.get();

  const totalRequests = requestsMetric.values.reduce((acc, v) => acc + v.value, 0);
  const totalErrors = errorsMetric.values.reduce((acc, v) => acc + v.value, 0);

  const totalDuration = durationMetric.values
    .filter((v) => v.metricName && v.metricName.endsWith("_sum"))
    .reduce((acc, v) => acc + v.value, 0);

  const count = durationMetric.values
    .filter((v) => v.metricName && v.metricName.endsWith("_count"))
    .reduce((acc, v) => acc + v.value, 0);

  const avgResponseTime = (count > 0 ? (totalDuration / count) * 1000 : 0).toFixed(2);
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) + "%" : "0%";

  const requestsPerSecond = totalRequests / process.uptime();
  return {
    totalRequests,
    totalErrors,
    avgResponseTime,
    errorRate,
    requestsPerSecond,
  };
}
