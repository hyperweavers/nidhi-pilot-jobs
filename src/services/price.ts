import axios, { AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import axiosRetry from 'axios-retry';
import { CookieJar } from 'tough-cookie';

const GOLD_RETAIL_PRICE_API_URL = process.env.GOLD_RETAIL_PRICE_API_URL || '';
const GOLD_RETAIL_PRICE_API_BACKUP_URL =
  process.env.GOLD_RETAIL_PRICE_API_BACKUP_URL || '';

export async function fetchGoldPrice(): Promise<number> {
  axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
      // eslint-disable-next-line no-console
      console.log(`Retry attempt: ${retryCount}`);
      return retryCount * 2000;
    },
    retryCondition: (error) => {
      switch (error.response?.status) {
        case 408: // Request Timeout
        case 500: // Internal Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          return true;

        default:
          return false;
      }
    },
  });

  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));

  let price = null;

  try {
    const response = await client.get(GOLD_RETAIL_PRICE_API_URL);

    price = parsePrimaryApiResponse(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error fetching retail data: ${JSON.stringify(error)}`);
  }

  if (!price) {
    // eslint-disable-next-line no-console
    console.info('Primary API failed. Falling back to backup API...');

    try {
      const response = await client.get(GOLD_RETAIL_PRICE_API_BACKUP_URL);

      price = parseSecondaryApiResponse(response);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching retail data: ${JSON.stringify(error)}`);
    }
  }

  return price;
}

const parsePrimaryApiResponse = (response: AxiosResponse) => {
  let price = null;

  if (response.data && response.data['22kt']) {
    price = response.data['22kt'].match(/[\d]+/g).slice(0, -1).join('');
  } else {
    // eslint-disable-next-line no-console
    console.error(`Invalid response data: ${JSON.stringify(response)}`);
  }

  return price;
};

const parseSecondaryApiResponse = (response: AxiosResponse) => {
  let price = null;

  if (response.data) {
    const stateWiseGoldPriceList = response.data.data?.getregionalgoldrates;

    if (
      stateWiseGoldPriceList &&
      Array.isArray(stateWiseGoldPriceList) &&
      stateWiseGoldPriceList.length > 0
    ) {
      const chennaiPrice = stateWiseGoldPriceList.find(
        (item) => item.State?.toLowerCase()?.replace(/\s/g, '') === 'tamilnadu'
      );

      if (chennaiPrice) {
        price = chennaiPrice.Rate;
      } else {
        // eslint-disable-next-line no-console
        console.error(
          `TN data not found: ${JSON.stringify(stateWiseGoldPriceList)}`
        );
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(`Invalid data format: ${JSON.stringify(response)}`);
    }
  } else {
    // eslint-disable-next-line no-console
    console.error(`Invalid response data: ${JSON.stringify(response)}`);
  }

  return price;
};
