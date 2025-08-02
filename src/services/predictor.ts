import { HistoricalRate } from '../types';

export function computeDailySlope(rates: HistoricalRate[]): number {
  const n = rates.length;
  if (n < 2) {
    return 0;
  }

  // Map dates to x = 0..n-1, y = price
  const xs = rates.map((_, i) => i);
  const ys = rates.map((r) => r.retailPrice);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0,
    den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += Math.pow(xs[i] - xMean, 2);
  }
  return den ? num / den : 0; // INR per day
}

export function predictPrice(
  currentPrice: number,
  avgSentiment: number,
  historical: HistoricalRate[]
): number {
  const slope = computeDailySlope(historical);
  const histForecast = historical.length
    ? historical[historical.length - 1].retailPrice + slope
    : currentPrice;

  const sentimentForecast = currentPrice * (1 + avgSentiment / 100);

  // Blend equally
  return parseFloat(((histForecast + sentimentForecast) / 2).toFixed(2));
}
