import { describe, expect, it, vi } from "vitest";
import { runCycle } from "../src/runtime";

describe("runCycle", () => {
  it("places order in trading mode when edge exists", async () => {
    const kalshiClient = {
      getQuote: vi.fn(async () => ({ ticker: "KX-W", yesPrice: 0.45, noPrice: 0.55 })),
      placeOrder: vi.fn(async () => undefined),
    } as any;

    const weatherFetcher = vi.fn(async () => ({
      locationId: "den",
      pYes: 0.65,
      modelSpreadF: 12,
      observedTempF: 70,
    }));

    const env = {
      KALSHI_API_KEY: "k",
      KALSHI_API_SECRET: "s",
      BANKROLL_USD: "1000",
      KALSHI_TRADING_ENABLED: "true",
      MIN_EDGE_PCT: "0.05",
      WEATHER_LOCATIONS_JSON: JSON.stringify([
        {
          id: "den",
          name: "Denver",
          latitude: 39.7,
          longitude: -104.9,
          ticker: "KX-W",
          side: "yes",
          thresholdF: 70,
          resolveHourUtc: 0,
        },
      ]),
    } as any;

    const result = await runCycle(env, { kalshiClient, weatherFetcher });
    expect(result.placed).toBe(1);
    expect(kalshiClient.placeOrder).toHaveBeenCalledTimes(1);
  });

  it("runs in weather-only mode without kalshi credentials", async () => {
    const kalshiClient = {
      getQuote: vi.fn(async () => ({ ticker: "KX-W", yesPrice: 0.55, noPrice: 0.45 })),
      placeOrder: vi.fn(async () => undefined),
    } as any;

    const weatherFetcher = vi.fn(async () => ({
      locationId: "den",
      pYes: 0.56,
      modelSpreadF: 12,
      observedTempF: 70,
    }));

    const env = {
      BANKROLL_USD: "1000",
      WEATHER_ONLY_MODE: "true",
      WEATHER_LOCATIONS_JSON: JSON.stringify([
        {
          id: "den",
          name: "Denver",
          latitude: 39.7,
          longitude: -104.9,
          side: "yes",
          thresholdF: 70,
          resolveHourUtc: 0,
        },
      ]),
    } as any;

    const result = await runCycle(env, { kalshiClient, weatherFetcher });
    expect(result.placed).toBe(0);
    expect(result.skipped).toBe(1);
    expect(kalshiClient.getQuote).not.toHaveBeenCalled();
  });

  it("skips when no edge", async () => {
    const kalshiClient = {
      getQuote: vi.fn(async () => ({ ticker: "KX-W", yesPrice: 0.55, noPrice: 0.45 })),
      placeOrder: vi.fn(async () => undefined),
    } as any;

    const weatherFetcher = vi.fn(async () => ({
      locationId: "den",
      pYes: 0.56,
      modelSpreadF: 12,
      observedTempF: 70,
    }));

    const env = {
      KALSHI_API_KEY: "k",
      KALSHI_API_SECRET: "s",
      BANKROLL_USD: "1000",
      KALSHI_TRADING_ENABLED: "true",
      MIN_EDGE_PCT: "0.05",
      WEATHER_LOCATIONS_JSON: JSON.stringify([
        {
          id: "den",
          name: "Denver",
          latitude: 39.7,
          longitude: -104.9,
          ticker: "KX-W",
          side: "yes",
          thresholdF: 70,
          resolveHourUtc: 0,
        },
      ]),
    } as any;

    const result = await runCycle(env, { kalshiClient, weatherFetcher });
    expect(result.placed).toBe(0);
    expect(result.skipped).toBe(1);
  });
});
