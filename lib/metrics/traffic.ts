let totalRequests = 0;
let totalErrors = 0;
let totalResponseTime = 0;

let requestsLastSecond = 0;
let rps = 0;

// requests per second calculation
setInterval(() => {
  rps = requestsLastSecond;
  requestsLastSecond = 0;
}, 1000);

export function trackRequest(duration: number, isError = false) {
  totalRequests++;
  requestsLastSecond++;

  totalResponseTime += duration;

  if (isError) totalErrors++;
}

export function getTrafficMetrics() {
  const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

  return {
    requestsPerSecond: rps,
    totalRequests,
    totalErrors,
    errorRate: errorRate.toFixed(2),
    avgResponseTime: `${avgResponseTime.toFixed(2)} ms`,
  };
}
