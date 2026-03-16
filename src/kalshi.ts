import type { Quote, Side } from "./types";

export class KalshiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly apiSecret: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async getQuote(ticker: string): Promise<Quote> {
    const res = await this.fetchImpl(`${this.baseUrl}/markets/${ticker}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Quote fetch failed (${res.status})`);

    const data = (await res.json()) as { yes_ask: number; no_ask: number };
    return {
      ticker,
      yesPrice: data.yes_ask / 100,
      noPrice: data.no_ask / 100,
    };
  }

  async placeOrder(input: {
    ticker: string;
    side: Side;
    maxCostUsd: number;
    limitPrice: number;
  }): Promise<void> {
    const res = await this.fetchImpl(`${this.baseUrl}/portfolio/orders`, {
      method: "POST",
      headers: {
        ...this.headers(),
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ticker: input.ticker,
        side: input.side.toUpperCase(),
        order_type: "limit",
        action: "buy",
        count: Math.floor(input.maxCostUsd / Math.max(input.limitPrice, 0.01)),
        yes_price: input.side === "yes" ? Math.round(input.limitPrice * 100) : undefined,
        no_price: input.side === "no" ? Math.round(input.limitPrice * 100) : undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`Order failed (${res.status}): ${await res.text()}`);
    }
  }

  private headers() {
    return {
      "KALSHI-ACCESS-KEY": this.apiKey,
      "KALSHI-ACCESS-SECRET": this.apiSecret,
    };
  }
}
