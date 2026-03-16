import { positionSizeUsd } from "./risk";
import type { Quote, Side, WeatherLocation, WeatherSignal } from "./types";

export interface StrategyConfig {
  bankrollUsd: number;
  maxTradeRiskPct: number;
  minEdgePct: number;
}

export interface PlannedOrder {
  ticker: string;
  side: Side;
  maxCostUsd: number;
  limitPrice: number;
  fairProbability: number;
  edgePct: number;
}

export function buildWeatherOrder(
  location: WeatherLocation,
  signal: WeatherSignal,
  quote: Quote,
  cfg: StrategyConfig,
): PlannedOrder | null {
  const fairP = location.side === "yes" ? signal.pYes : 1 - signal.pYes;
  const marketP = location.side === "yes" ? quote.yesPrice : quote.noPrice;
  const edgePct = fairP - marketP;

  if (edgePct < cfg.minEdgePct) return null;

  const maxCostUsd = positionSizeUsd({
    bankrollUsd: cfg.bankrollUsd,
    maxTradeRiskPct: cfg.maxTradeRiskPct,
    confidence: fairP,
    price: marketP,
  });

  if (maxCostUsd < 1) return null;

  return {
    ticker: location.ticker,
    side: location.side,
    maxCostUsd,
    limitPrice: marketP,
    fairProbability: fairP,
    edgePct,
  };
}
