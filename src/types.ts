export interface Env {
  KALSHI_API_BASE?: string;
  KALSHI_API_KEY: string;
  KALSHI_API_SECRET: string;
  KALSHI_TRADING_ENABLED?: string;
  LEADERBOARD_URL: string;
  MIN_LEADER_WIN_RATE?: string;
  MIN_LEADER_TRADES?: string;
  MAX_DAILY_RISK_PCT?: string;
  MAX_TRADE_RISK_PCT?: string;
  BANKROLL_USD: string;
}

export type Side = "yes" | "no";

export interface Leader {
  username: string;
  winRate: number;
  trades: number;
}

export interface LeaderSignal {
  username: string;
  marketTicker: string;
  side: Side;
  confidence: number;
  timestamp: string;
}

export interface Quote {
  ticker: string;
  yesPrice: number;
  noPrice: number;
}
