# Kalshi Copy Bot (Cloudflare Worker)

Cron-driven Cloudflare Worker that:
1. Pulls a feed of leader stats + live signals
2. Filters leaders by win rate/trade count
3. Sizes trades with capped fractional Kelly
4. Places orders on Kalshi (or dry-run mode)

## Important
- This repo does **not** guarantee profitability.
- Past performance is not predictive of future returns.
- You must verify Kalshi API auth/signing requirements for your account tier.

## Environment variables
Set these in Cloudflare Worker secrets/vars:

- `KALSHI_API_KEY`
- `KALSHI_API_SECRET`
- `BANKROLL_USD` (e.g. `1000`)
- `LEADERBOARD_URL` (JSON endpoint with leaders/signals)
- `KALSHI_API_BASE` (optional, default: `https://api.elections.kalshi.com/trade-api/v2`)
- `KALSHI_TRADING_ENABLED` (`true` to place orders, otherwise paper mode)
- `MIN_LEADER_WIN_RATE` (default `0.9`)
- `MIN_LEADER_TRADES` (default `50`)
- `MAX_TRADE_RISK_PCT` (default `0.02`)

## Provider payload format
`LEADERBOARD_URL` must return JSON:

```json
{
  "leaders": [
    {"username":"alice","winRate":0.92,"trades":140}
  ],
  "signals": [
    {
      "username":"alice",
      "marketTicker":"KXTEST-2026",
      "side":"yes",
      "confidence":0.74,
      "timestamp":"2026-03-16T06:00:00Z"
    }
  ]
}
```

## Dev
```bash
npm install
npm test
npm run dev
```

## Deploy
```bash
npx wrangler secret put KALSHI_API_KEY
npx wrangler secret put KALSHI_API_SECRET
npx wrangler deploy
```

## Candidate public accounts to manually verify
From recent public Ideas feed activity (not performance-verified):
- `delito`
- `WorkHardPlayHard`
- `broad.bride`
- `bigmash`
- `cyruy`

See `research/candidates.md` for details.
