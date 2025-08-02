import { fetchGoldPrice } from './services/price';
import { fetchAverageSentiment } from './services/sentiment';
import { fetchHistoricalRates } from './services/historical';
import { predictPrice } from './services/predictor';

async function main(): Promise<void> {
  try {
    const [price, sentiment, history] = await Promise.all([
      fetchGoldPrice(),
      fetchAverageSentiment(),
      fetchHistoricalRates(),
    ]);

    const forecast = predictPrice(price, sentiment, history);

    // eslint-disable-next-line no-console
    console.info('Current 22K price:', price);
    // eslint-disable-next-line no-console
    console.info('Avg sentiment:', sentiment.toFixed(2));
    // eslint-disable-next-line no-console
    console.info(
      'Historic slope (INR/day):',
      history.length > 1
        ? (
            (history[history.length - 1].retailPrice - history[0].retailPrice) /
            (history.length - 1)
          ).toFixed(2)
        : 'N/A'
    );
    // eslint-disable-next-line no-console
    console.info('Predicted tomorrow price:', forecast);

    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error during prediction:', err);
    process.exit(1);
  }
}

main();
