export type DashboardMetrics = {
  appName: string;
  environment: string;
  region: string;
  version: string;
  branch: string;
  buildTime: string;
  latestCommit: string;
  deployTime: string;

  memoryUsage: string;
  cpuUsage: string;
  uptime: string;

  requestsPerSecond: number;
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  avgResponseTime: string;
};
