import { describe, expect, it } from "vitest";
import { buildWeatherOrder } from "../src/market";

describe("buildWeatherOrder", () => {
  const cfg = { bankrollUsd: 1000, maxTradeRiskPct: 0.02, minEdgePct: 0.05 };

  it("returns null when edge is below threshold", () => {
    const order = buildWeatherOrder(
      {
        id: "x",
        name: "X",
        latitude: 1,
        longitude: 1,
        ticker: "KX-T",
        side: "yes",
        thresholdF: 70,
        resolveHourUtc: 0,
      },
      { locationId: "x", pYes: 0.52, modelSpreadF: 5, observedTempF: 60 },
      { ticker: "KX-T", yesPrice: 0.5, noPrice: 0.5 },
      cfg,
    );

    expect(order).toBeNull();
  });

  it("creates an order when edge is sufficient", () => {
    const order = buildWeatherOrder(
      {
        id: "x",
        name: "X",
        latitude: 1,
        longitude: 1,
        ticker: "KX-T",
        side: "yes",
        thresholdF: 70,
        resolveHourUtc: 0,
      },
      { locationId: "x", pYes: 0.65, modelSpreadF: 5, observedTempF: 60 },
      { ticker: "KX-T", yesPrice: 0.5, noPrice: 0.5 },
      cfg,
    );

    expect(order).not.toBeNull();
    expect(order?.maxCostUsd).toBeGreaterThan(0);
    expect(order?.edgePct).toBeGreaterThanOrEqual(0.05);
  });
});
