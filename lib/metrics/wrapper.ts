import { httpRequestsTotal, httpDuration } from "./traffic";

export async function withMetrics<T>(fn: () => Promise<T>) {
  const start = Date.now();

  httpRequestsTotal.inc();

  try {
    const result = await fn();

    const duration = (Date.now() - start) / 1000;
    httpDuration.observe(duration);

    return result;
  } catch (err) {
    throw err;
  }
}
