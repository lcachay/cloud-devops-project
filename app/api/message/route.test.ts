import { GET } from "@/app/api/message/route";

describe("GET /api/message", () => {
  it("should return a message", async () => {
    const res = await GET();
    const data = await res.json();

    expect(data).toHaveProperty("message");
  });
});
