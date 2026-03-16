# Kalshi Weather Bot (Worker + Docker)

This project now focuses on **weather markets** (not copy trading).

It computes a fair probability from weather data, compares that to market-implied probability, and only places a trade when edge exceeds a threshold.

## Strategy (simple + testable)
1. Pull weather forecasts from Open-Meteo.
2. Estimate probability of event (e.g. temp above threshold).
3. Read Kalshi market quote.
4. Take bet only when `fairProb - marketProb >= MIN_EDGE_PCT`.
5. Size with capped fractional Kelly.

## Runtimes
- **Cloudflare Worker** (cron): default runtime.
- **Docker container**: same core strategy, longer/heavier execution if needed.

## Environment variables
Required:
- `KALSHI_API_KEY`
- `KALSHI_API_SECRET`
- `BANKROLL_USD`
- `WEATHER_LOCATIONS_JSON`

Optional:
- `KALSHI_API_BASE` (default `https://api.elections.kalshi.com/trade-api/v2`)
- `OPEN_METEO_API_BASE` (default `https://api.open-meteo.com`)
- `KALSHI_TRADING_ENABLED` (`true` for live orders; otherwise paper mode)
- `MAX_TRADE_RISK_PCT` (default `0.02`)
- `MIN_EDGE_PCT` (default `0.05`)
- `CRON_INTERVAL_MS` (Docker only, default `300000`)

## `WEATHER_LOCATIONS_JSON` format
```json
[
  {
    "id": "den",
    "name": "Denver",
    "latitude": 39.7392,
    "longitude": -104.9903,
    "ticker": "KXWEATHER-DEN-EXAMPLE",
    "side": "yes",
    "thresholdF": 70,
    "resolveHourUtc": 0
  }
]
```

## Local dev
```bash
npm install
npm test
npm run dev
```

## Worker deploy
```bash
npx wrangler secret put KALSHI_API_KEY
npx wrangler secret put KALSHI_API_SECRET
npx wrangler deploy
```

## Docker runtime
```bash
npm run build
docker build -t kalshi-weather-bot -f docker/Dockerfile .
docker run --env-file .env kalshi-weather-bot
```

## Tests
Covers:
- risk sizing
- weather probability math + weather fetch parsing
- market edge/order planning
- Kalshi client quote/order behavior
- end-to-end run cycle orchestration

## Risk warning
This is trading software. It can lose money. Keep live mode off until paper results are acceptable.
