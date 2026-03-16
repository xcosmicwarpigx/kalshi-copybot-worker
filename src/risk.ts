export interface SizingInputs {
  bankrollUsd: number;
  maxTradeRiskPct: number;
  confidence: number;
  price: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// Fractional Kelly sizing on binary markets.
export function positionSizeUsd(input: SizingInputs): number {
  const p = clamp(input.confidence, 0.01, 0.99);
  const q = 1 - p;
  const b = (1 - input.price) / input.price;
  const rawKelly = (b * p - q) / b;
  const fractionalKelly = clamp(rawKelly * 0.25, 0, input.maxTradeRiskPct);
  return Math.max(0, input.bankrollUsd * fractionalKelly);
}
