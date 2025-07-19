import { fetchIbjaGoldPrice } from './services/price';
import { fetchAverageSentiment } from './services/sentiment';
import { fetchHistoricalRates } from './services/historical';
import { predictPrice } from './services/predictor';

async function main(): Promise<void> {
  try {
    const [price, sentiment, history] = await Promise.all([
    // const [history] = await Promise.all([
      fetchIbjaGoldPrice(),
      fetchAverageSentiment(),
      fetchHistoricalRates(),
    ]);

    const forecast = predictPrice(price, sentiment, history);

    // eslint-disable-next-line no-console
    console.log('Current 24K price:', price);
    // eslint-disable-next-line no-console
    console.log('Avg sentiment:', sentiment.toFixed(2));
    // eslint-disable-next-line no-console
    console.log(
      'Historic slope (INR/day):',
      history.length > 1
        ? (
            (history[history.length - 1].price - history[0].price) /
            (history.length - 1)
          ).toFixed(2)
        : 'N/A'
    );
    // eslint-disable-next-line no-console
    console.log('Predicted tomorrow price:', forecast);

    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error during prediction:', err);
    process.exit(1);
  }
}

main();
