import { runCycle } from "./runtime";
import type { Env } from "./types";

function readEnv(): Env {
  const required = ["BANKROLL_USD", "WEATHER_LOCATIONS_JSON"];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var: ${key}`);
    }
  }

  if (process.env.WEATHER_ONLY_MODE !== "true") {
    for (const key of ["KALSHI_API_KEY", "KALSHI_API_SECRET"]) {
      if (!process.env[key]) {
        throw new Error(`Missing required env var for trading mode: ${key}`);
      }
    }
  }

  return process.env as unknown as Env;
}

async function loop() {
  const env = readEnv();
  const intervalMs = Number(process.env.CRON_INTERVAL_MS ?? 300000);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const started = Date.now();
    try {
      const result = await runCycle(env);
      console.log(`[cycle] scanned=${result.scanned} placed=${result.placed} skipped=${result.skipped}`);
    } catch (error) {
      console.error("[cycle] error", error);
    }

    const elapsed = Date.now() - started;
    const sleepMs = Math.max(1000, intervalMs - elapsed);
    await new Promise((resolve) => setTimeout(resolve, sleepMs));
  }
}

loop().catch((e) => {
  console.error(e);
  process.exit(1);
});
