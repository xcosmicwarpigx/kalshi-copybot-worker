import { KalshiClient } from "./kalshi";
import { buildWeatherOrder, type StrategyConfig } from "./market";
import type { Env, WeatherLocation } from "./types";
import { fetchWeatherSignal } from "./weather";

export interface RunResult {
  scanned: number;
  placed: number;
  skipped: number;
}

export async function runCycle(
  env: Env,
  deps: {
    kalshiClient?: KalshiClient;
    weatherFetcher?: typeof fetchWeatherSignal;
  } = {},
): Promise<RunResult> {
  const cfg: StrategyConfig = {
    bankrollUsd: Number(env.BANKROLL_USD),
    maxTradeRiskPct: Number(env.MAX_TRADE_RISK_PCT ?? 0.02),
    minEdgePct: Number(env.MIN_EDGE_PCT ?? 0.05),
  };

  const locations = JSON.parse(env.WEATHER_LOCATIONS_JSON) as WeatherLocation[];
  const weatherBase = env.OPEN_METEO_API_BASE ?? "https://api.open-meteo.com";

  const client =
    deps.kalshiClient ??
    new KalshiClient(
      env.KALSHI_API_BASE ?? "https://api.elections.kalshi.com/trade-api/v2",
      env.KALSHI_API_KEY,
      env.KALSHI_API_SECRET,
    );
  const weatherFetcher = deps.weatherFetcher ?? fetchWeatherSignal;

  let placed = 0;
  let skipped = 0;

  for (const loc of locations) {
    const signal = await weatherFetcher(loc, weatherBase);
    const quote = await client.getQuote(loc.ticker);
    const order = buildWeatherOrder(loc, signal, quote, cfg);

    if (!order) {
      skipped++;
      continue;
    }

    if (env.KALSHI_TRADING_ENABLED === "true") {
      await client.placeOrder({
        ticker: order.ticker,
        side: order.side,
        maxCostUsd: order.maxCostUsd,
        limitPrice: order.limitPrice,
      });
    }

    placed++;
  }

  return { scanned: locations.length, placed, skipped };
}
