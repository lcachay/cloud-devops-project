import { httpRequestsTotal, httpErrorsTotal, httpDuration } from "../../middleware";

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
  const avgResponseTime = count > 0 ? totalDuration / count : 0;

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
