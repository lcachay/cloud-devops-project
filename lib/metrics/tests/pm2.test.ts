import { spawnSync } from "child_process";
import { getPm2Metrics } from "@/lib/metrics/pm2";

jest.mock("child_process", () => ({
  spawnSync: jest.fn(),
}));

const mockSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;
type SpawnResult = ReturnType<typeof spawnSync>;

const createSpawnResult = (overrides: Partial<SpawnResult>): SpawnResult =>
  ({
    pid: 0,
    output: [],
    stdout: "",
    stderr: "",
    status: 0,
    signal: null,
    error: undefined,
    ...overrides,
  }) as SpawnResult;

describe("getPm2Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns parsed PM2 metrics when commands succeed", () => {
    mockSpawnSync
      .mockImplementationOnce(() =>
        createSpawnResult({
          status: 0,
          stdout: JSON.stringify([
            {
              monit: { cpu: 17, memory: 22222222 },
              pm2_env: {
                status: "online",
                pm_uptime: 123456789,
                restart_time: 3,
              },
            },
          ]),
        }),
      )
      .mockImplementationOnce(() => createSpawnResult({ status: 0, stdout: "938836\n" }));

    const result = getPm2Metrics();

    expect(spawnSync).toHaveBeenNthCalledWith(1, "pm2", ["jlist"], { encoding: "utf-8" });
    expect(spawnSync).toHaveBeenNthCalledWith(2, "sh", ["-c", "grep MemTotal /proc/meminfo | awk '{print $2}'"], {
      encoding: "utf-8",
    });
    expect(result).toEqual({
      cpu: 17,
      memory: 22222222,
      totalMemory: "938836",
      processStatus: "online",
      uptime: 123456789,
      restartCount: 3,
    });
  });

  it("returns mock metrics when PM2 command fails", () => {
    mockSpawnSync
      .mockImplementationOnce(() => createSpawnResult({ status: 1, stdout: "" }))
      .mockImplementationOnce(() => createSpawnResult({ status: 0, stdout: "938836\n" }));

    const result = getPm2Metrics();

    expect(result).toEqual({
      cpu: 0.2,
      memory: 80855040,
      totalMemory: "938836",
      processStatus: "online",
      uptime: 1774835543790,
      restartCount: 0,
    });
  });

  it("returns default metrics when PM2 output is invalid JSON", () => {
    mockSpawnSync
      .mockImplementationOnce(() => createSpawnResult({ status: 0, stdout: "not-json" }))
      .mockImplementationOnce(() => createSpawnResult({ status: 0, stdout: "938836\n" }));

    const result = getPm2Metrics();

    expect(result).toEqual({
      cpu: 0,
      memory: 0,
      totalMemory: "0",
      processStatus: "unknown",
      uptime: 0,
      restartCount: 0,
    });
  });
});
