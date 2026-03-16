import { describe, expect, it, vi } from "vitest";
import { KalshiClient } from "../src/kalshi";

describe("KalshiClient", () => {
  it("parses quote prices", async () => {
    const mockFetch = vi.fn(async () =>
      new Response(JSON.stringify({ yes_ask: 54, no_ask: 47 }), { status: 200 }),
    );

    const client = new KalshiClient("https://example", "k", "s", mockFetch as unknown as typeof fetch);
    const quote = await client.getQuote("ABC");

    expect(quote.yesPrice).toBe(0.54);
    expect(quote.noPrice).toBe(0.47);
  });

  it("throws on failed order", async () => {
    const mockFetch = vi.fn(async () => new Response("boom", { status: 400 }));

    const client = new KalshiClient("https://example", "k", "s", mockFetch as unknown as typeof fetch);

    await expect(
      client.placeOrder({ ticker: "ABC", side: "yes", maxCostUsd: 10, limitPrice: 0.5 }),
    ).rejects.toThrow("Order failed");
  });
});
