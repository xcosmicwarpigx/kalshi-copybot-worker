import { KalshiClient } from "./kalshi";
import { fetchProviderPayload } from "./provider";
import { buildOrderFromSignal, filterLeaders, type StrategyConfig } from "./strategy";
import type { Env } from "./types";

async function run(env: Env): Promise<{ placed: number; skipped: number }> {
  const cfg: StrategyConfig = {
    minLeaderWinRate: Number(env.MIN_LEADER_WIN_RATE ?? 0.9),
    minLeaderTrades: Number(env.MIN_LEADER_TRADES ?? 50),
    maxTradeRiskPct: Number(env.MAX_TRADE_RISK_PCT ?? 0.02),
    bankrollUsd: Number(env.BANKROLL_USD),
  };

  const { leaders, signals } = await fetchProviderPayload(env.LEADERBOARD_URL);
  const trusted = new Set(filterLeaders(leaders, cfg).map((l) => l.username));

  const client = new KalshiClient(
    env.KALSHI_API_BASE ?? "https://api.elections.kalshi.com/trade-api/v2",
    env.KALSHI_API_KEY,
    env.KALSHI_API_SECRET,
  );

  let placed = 0;
  let skipped = 0;

  for (const signal of signals) {
    if (!trusted.has(signal.username)) {
      skipped++;
      continue;
    }

    const quote = await client.getQuote(signal.marketTicker);
    const plan = buildOrderFromSignal(signal, quote, cfg);
    if (!plan) {
      skipped++;
      continue;
    }

    if (env.KALSHI_TRADING_ENABLED === "true") {
      await client.placeOrder({
        ticker: plan.ticker,
        side: plan.side,
        maxCostUsd: plan.maxCostUsd,
        limitPrice: plan.limitPrice,
      });
    }
    placed++;
  }

  return { placed, skipped };
}

export default {
  async scheduled(_: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(run(env));
  },
  async fetch(_: Request, env: Env): Promise<Response> {
    const result = await run(env);
    return Response.json(result);
  },
};
