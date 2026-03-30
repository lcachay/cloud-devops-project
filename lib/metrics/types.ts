export interface DashboardMetrics {
  appName: string;
  environment: string;
  region: string;
  version: string;
  branch: string;
  buildTime: string;
  latestCommit: string;
  deployTime: string;
  deployStatus: string;

  memory: string;
  cpu: string;
  processStatus: string;
  uptime: string;
  restartCount: number;
  totalMemory: string;

  requestsPerSecond: number;
  totalRequests: number;
  totalErrors: number;
  errorRate: string;
  avgResponseTime: string;
}
