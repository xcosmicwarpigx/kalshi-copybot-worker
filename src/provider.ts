import type { Leader, LeaderSignal } from "./types";

export interface ProviderPayload {
  leaders: Leader[];
  signals: LeaderSignal[];
}

export async function fetchProviderPayload(url: string, fetchImpl: typeof fetch = fetch) {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`leaderboard fetch failed (${res.status})`);
  return (await res.json()) as ProviderPayload;
}
