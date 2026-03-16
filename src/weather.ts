import type { WeatherLocation, WeatherSignal } from "./types";

export interface WeatherApiResponse {
  current: { temperature_2m: number };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-ax * ax);
  return sign * y;
}

function normalCdf(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

export function probabilityTempAbove(thresholdF: number, meanF: number, spreadF: number): number {
  const stdDev = Math.max(spreadF / 2, 0.5);
  return 1 - normalCdf(thresholdF, meanF, stdDev);
}

export async function fetchWeatherSignal(
  location: WeatherLocation,
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WeatherSignal> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m",
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: "fahrenheit",
    timezone: "UTC",
    forecast_days: "1",
  });

  const res = await fetchImpl(`${baseUrl}/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error(`weather fetch failed (${res.status})`);

  const data = (await res.json()) as WeatherApiResponse;
  const maxF = data.daily.temperature_2m_max[0];
  const minF = data.daily.temperature_2m_min[0];
  const meanF = (maxF + minF) / 2;
  const spreadF = Math.max(1, maxF - minF);

  return {
    locationId: location.id,
    pYes: probabilityTempAbove(location.thresholdF, meanF, spreadF),
    modelSpreadF: spreadF,
    observedTempF: data.current.temperature_2m,
  };
}
