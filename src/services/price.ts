import axios from 'axios';
import { load } from 'cheerio';

export async function fetchIbjaGoldPrice(): Promise<number> {
  const url = 'https://ibjarates.com/';
  const { data } = await axios.get(url);
  const $ = load(data);
  // IBJA lists 22K and 24K; pick 24K per 10g
  const selector = '#GoldRatesCompare999';
  const priceText = $(selector).first().text().trim();
  return parseFloat(priceText.replace(/,/g, ''));
}
