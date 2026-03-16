import { describe, expect, it } from "vitest";
import { positionSizeUsd } from "../src/risk";

describe("positionSizeUsd", () => {
  it("sizes to zero when edge is negative", () => {
    const size = positionSizeUsd({
      bankrollUsd: 1000,
      confidence: 0.40,
      price: 0.60,
      maxTradeRiskPct: 0.02,
    });
    expect(size).toBe(0);
  });

  it("respects max risk cap", () => {
    const size = positionSizeUsd({
      bankrollUsd: 1000,
      confidence: 0.9,
      price: 0.2,
      maxTradeRiskPct: 0.02,
    });
    expect(size).toBeLessThanOrEqual(20);
    expect(size).toBeGreaterThan(0);
  });
});
