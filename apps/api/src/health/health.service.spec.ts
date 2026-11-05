import { HealthService } from "./health.service";

describe("HealthService", () => {
  it("returns a minimal, non-sensitive health status", () => {
    expect(new HealthService().getHealth()).toEqual({ status: "ok" });
  });
});
