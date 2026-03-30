import { withMetrics } from "../wrapper";
import * as traffic from "../traffic";

describe("withMetrics", () => {
  beforeEach(() => {
    jest.spyOn(traffic.httpRequestsTotal, "inc").mockClear();
    jest.spyOn(traffic.httpDuration, "observe").mockClear();
  });

  test("calls inc and observe on success", async () => {
    const incMock = jest.spyOn(traffic.httpRequestsTotal, "inc").mockImplementation(() => {});
    const observeMock = jest.spyOn(traffic.httpDuration, "observe").mockImplementation(() => {});

    const result = await withMetrics(async () => "ok");

    expect(result).toBe("ok");
    expect(incMock).toHaveBeenCalled();
    expect(observeMock).toHaveBeenCalled();
    const durationArg = observeMock.mock.calls[0][0];
    expect(durationArg).toBeGreaterThanOrEqual(0);
  });

  test("propagates errors", async () => {
    const error = new Error("fail");
    await expect(withMetrics(() => Promise.reject(error))).rejects.toThrow("fail");
  });
});
