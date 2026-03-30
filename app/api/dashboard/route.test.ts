import { GET as getMessage } from "@/app/api/message/route";
import { GET as getDashboard } from "@/app/api/dashboard/route";
import { getTrafficMetrics } from "@/lib/metrics/traffic";
import { getCICDMetrics } from "@/lib/metrics/cicd";
import { getPm2Metrics } from "@/lib/metrics/pm2";

const mockGetTrafficMetrics = getTrafficMetrics as jest.MockedFunction<typeof getTrafficMetrics>;
const mockGetCICDMetrics = getCICDMetrics as jest.MockedFunction<typeof getCICDMetrics>;
const mockGetPm2Metrics = getPm2Metrics as jest.MockedFunction<typeof getPm2Metrics>;

jest.mock("@/lib/metrics/traffic", () => ({
  getTrafficMetrics: jest.fn(),
}));

jest.mock("@/lib/metrics/cicd", () => ({
  getCICDMetrics: jest.fn(),
}));

jest.mock("@/lib/metrics/pm2", () => ({
  getPm2Metrics: jest.fn(),
}));

jest.mock("@/lib/metrics/wrapper", () => ({
  withMetrics: async <T>(fn: () => Promise<T>): Promise<T> => fn(),
}));

describe("GET /api/message", () => {
  it("should return a message", async () => {
    const res = await getMessage();
    const data = await res.json();

    expect(data).toHaveProperty("message");
  });
});

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return merged dashboard metrics", async () => {
    mockGetCICDMetrics.mockReturnValue({
      appName: "cloud-devops-project",
      environment: "test",
      region: "us-east-1",
      version: "1.0.0",
      branch: "main",
      buildTime: "2026-03-30T12:00:00Z",
      latestCommit: "abc123",
      deployTime: "2026-03-30T12:05:00Z",
      deployStatus: "success",
    });
    mockGetPm2Metrics.mockReturnValue({
      cpu: 12,
      memory: 2048,
      totalMemory: "8192",
      processStatus: "online",
      uptime: 123456,
      restartCount: 2,
    });
    mockGetTrafficMetrics.mockResolvedValue({
      totalRequests: 100,
      totalErrors: 2,
      avgResponseTime: "42.00",
      errorRate: "2.00%",
      requestsPerSecond: 1.25,
    });

    const res = await getDashboard();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(mockGetPm2Metrics).toHaveBeenCalledTimes(1);
    expect(mockGetTrafficMetrics).toHaveBeenCalledTimes(1);
    expect(mockGetCICDMetrics).toHaveBeenCalledTimes(1);
    expect(data).toEqual({
      appName: "cloud-devops-project",
      environment: "test",
      region: "us-east-1",
      version: "1.0.0",
      branch: "main",
      buildTime: "2026-03-30T12:00:00Z",
      latestCommit: "abc123",
      deployTime: "2026-03-30T12:05:00Z",
      deployStatus: "success",
      cpu: 12,
      memory: 2048,
      totalMemory: "8192",
      processStatus: "online",
      uptime: 123456,
      restartCount: 2,
      totalRequests: 100,
      totalErrors: 2,
      avgResponseTime: "42.00",
      errorRate: "2.00%",
      requestsPerSecond: 1.25,
    });
  });

  it("should return a 500 response when metrics collection fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

    mockGetPm2Metrics.mockReturnValue({
      cpu: 0,
      memory: 0,
      totalMemory: "0",
      processStatus: "unknown",
      uptime: 0,
      restartCount: 0,
    });
    mockGetTrafficMetrics.mockRejectedValue(new Error("traffic failure"));

    const res = await getDashboard();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error building dashboard metrics:", expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
