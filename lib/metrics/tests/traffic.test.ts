import { getTrafficMetrics, httpDuration, httpErrorsTotal, httpRequestsTotal } from "@/lib/metrics/traffic";

type RequestsGetResult = Awaited<ReturnType<typeof httpRequestsTotal.get>>;
type ErrorsGetResult = Awaited<ReturnType<typeof httpErrorsTotal.get>>;
type DurationGetResult = Awaited<ReturnType<typeof httpDuration.get>>;

const requestsResult = (values: RequestsGetResult["values"]): RequestsGetResult =>
  ({
    values,
  }) as RequestsGetResult;

const errorsResult = (values: ErrorsGetResult["values"]): ErrorsGetResult =>
  ({
    values,
  }) as ErrorsGetResult;

const durationResult = (values: DurationGetResult["values"]): DurationGetResult =>
  ({
    values,
  }) as DurationGetResult;

describe("getTrafficMetrics", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("aggregates totals, computes averages, and formats error rate", async () => {
    jest
      .spyOn(httpRequestsTotal, "get")
      .mockResolvedValue(requestsResult([{ value: 15 }, { value: 5 }] as RequestsGetResult["values"]));

    jest
      .spyOn(httpErrorsTotal, "get")
      .mockResolvedValue(errorsResult([{ value: 1 }, { value: 1 }] as ErrorsGetResult["values"]));

    jest.spyOn(httpDuration, "get").mockResolvedValue(
      durationResult([
        { metricName: "http_request_duration_seconds_sum", value: 5 },
        { metricName: "http_request_duration_seconds_count", value: 20 },
      ] as DurationGetResult["values"]),
    );

    jest.spyOn(process, "uptime").mockReturnValue(10);

    const result = await getTrafficMetrics();

    expect(result).toEqual({
      totalRequests: 20,
      totalErrors: 2,
      avgResponseTime: "250.00",
      errorRate: "10.00%",
      requestsPerSecond: 2,
    });
  });

  it("handles zero requests and zero duration count", async () => {
    jest.spyOn(httpRequestsTotal, "get").mockResolvedValue(requestsResult([]));

    jest.spyOn(httpErrorsTotal, "get").mockResolvedValue(errorsResult([{ value: 3 }] as ErrorsGetResult["values"]));

    jest.spyOn(httpDuration, "get").mockResolvedValue(
      durationResult([
        { metricName: "http_request_duration_seconds_sum", value: 7 },
        { metricName: "http_request_duration_seconds_count", value: 0 },
      ] as DurationGetResult["values"]),
    );

    jest.spyOn(process, "uptime").mockReturnValue(5);

    const result = await getTrafficMetrics();

    expect(result).toEqual({
      totalRequests: 0,
      totalErrors: 3,
      avgResponseTime: "0.00",
      errorRate: "0%",
      requestsPerSecond: 0,
    });
  });
});
