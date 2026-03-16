export interface Env {
  KALSHI_API_BASE?: string;
  KALSHI_API_KEY?: string;
  KALSHI_API_SECRET?: string;
  KALSHI_TRADING_ENABLED?: string;
  WEATHER_ONLY_MODE?: string;
  BANKROLL_USD: string;
  MAX_TRADE_RISK_PCT?: string;
  MIN_EDGE_PCT?: string;
  WEATHER_LOCATIONS_JSON: string;
  OPEN_METEO_API_BASE?: string;
}

export interface WeatherLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  // Kalshi binary market ticker for this question (optional in weather-only mode).
  ticker?: string;
  // Side represented by the threshold question.
  side: "yes" | "no";
  thresholdF: number;
  resolveHourUtc: number;
}

export interface WeatherSignal {
  locationId: string;
  pYes: number;
  modelSpreadF: number;
  observedTempF: number;
}

export interface Quote {
  ticker: string;
  yesPrice: number;
  noPrice: number;
}

export type Side = "yes" | "no";
