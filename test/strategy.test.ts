import { describe, expect, it } from "vitest";
import { buildOrderFromSignal, filterLeaders } from "../src/strategy";

describe("filterLeaders", () => {
  it("filters by win rate and trade count", () => {
    const out = filterLeaders(
      [
        { username: "a", winRate: 0.91, trades: 120 },
        { username: "b", winRate: 0.95, trades: 8 },
        { username: "c", winRate: 0.82, trades: 100 },
      ],
      {
        minLeaderWinRate: 0.9,
        minLeaderTrades: 50,
        maxTradeRiskPct: 0.02,
        bankrollUsd: 1000,
      },
    );

    expect(out.map((x) => x.username)).toEqual(["a"]);
  });
});

describe("buildOrderFromSignal", () => {
  it("builds a trade plan for positive edge", () => {
    const plan = buildOrderFromSignal(
      {
        username: "a",
        marketTicker: "TEST-123",
        side: "yes",
        confidence: 0.75,
        timestamp: new Date().toISOString(),
      },
      {
        ticker: "TEST-123",
        yesPrice: 0.45,
        noPrice: 0.56,
      },
      {
        minLeaderWinRate: 0.9,
        minLeaderTrades: 50,
        maxTradeRiskPct: 0.02,
        bankrollUsd: 1000,
      },
    );

    expect(plan).not.toBeNull();
    expect(plan?.ticker).toBe("TEST-123");
    expect(plan?.maxCostUsd).toBeGreaterThan(0);
  });
});
