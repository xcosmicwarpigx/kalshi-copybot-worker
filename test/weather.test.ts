import { describe, expect, it } from "vitest";
import { fetchWeatherSignal, probabilityTempAbove } from "../src/weather";

describe("probabilityTempAbove", () => {
  it("returns high probability when threshold far below mean", () => {
    expect(probabilityTempAbove(40, 70, 12)).toBeGreaterThan(0.95);
  });

  it("returns low probability when threshold far above mean", () => {
    expect(probabilityTempAbove(95, 70, 12)).toBeLessThan(0.1);
  });
});

describe("fetchWeatherSignal", () => {
  it("parses open-meteo payload", async () => {
    const mockFetch = async () =>
      new Response(
        JSON.stringify({
          current: { temperature_2m: 66 },
          daily: { temperature_2m_max: [78], temperature_2m_min: [58] },
        }),
        { status: 200 },
      );

    const signal = await fetchWeatherSignal(
      {
        id: "den",
        name: "Denver",
        latitude: 39.7,
        longitude: -104.9,
        ticker: "KXWEATHER-DEN",
        side: "yes",
        thresholdF: 70,
        resolveHourUtc: 0,
      },
      "https://api.open-meteo.com",
      mockFetch as unknown as typeof fetch,
    );

    expect(signal.locationId).toBe("den");
    expect(signal.modelSpreadF).toBe(20);
    expect(signal.observedTempF).toBe(66);
    expect(signal.pYes).toBeGreaterThan(0);
    expect(signal.pYes).toBeLessThan(1);
  });
});
