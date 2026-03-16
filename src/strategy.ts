import { positionSizeUsd } from "./risk";
import type { Leader, LeaderSignal, Quote } from "./types";

export interface StrategyConfig {
  minLeaderWinRate: number;
  minLeaderTrades: number;
  maxTradeRiskPct: number;
  bankrollUsd: number;
}

export interface PlannedOrder {
  ticker: string;
  side: "yes" | "no";
  maxCostUsd: number;
  limitPrice: number;
  leader: string;
}

export function filterLeaders(leaders: Leader[], cfg: StrategyConfig): Leader[] {
  return leaders.filter(
    (l) => l.winRate >= cfg.minLeaderWinRate && l.trades >= cfg.minLeaderTrades,
  );
}

export function buildOrderFromSignal(
  signal: LeaderSignal,
  quote: Quote,
  cfg: StrategyConfig,
): PlannedOrder | null {
  const price = signal.side === "yes" ? quote.yesPrice : quote.noPrice;
  const maxCostUsd = positionSizeUsd({
    bankrollUsd: cfg.bankrollUsd,
    confidence: signal.confidence,
    price,
    maxTradeRiskPct: cfg.maxTradeRiskPct,
  });

  if (maxCostUsd < 1) return null;

  return {
    ticker: signal.marketTicker,
    side: signal.side,
    maxCostUsd,
    limitPrice: price,
    leader: signal.username,
  };
}
