// Mock axios
jest.mock('axios');

// Mock cheerio
jest.mock('cheerio', () => ({
  load: jest.fn()
}));

import axios from 'axios';
import cheerio from 'cheerio';

import { fetchIbjaGoldPrice } from '../../src/services/price';

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCheerio = cheerio as jest.Mocked<typeof cheerio>;

describe('fetchIbjaGoldPrice', () => {
  it('parses 24K price from HTML', async () => {
    const html = `
      <table id="grdData">
        <tr><td>24K</td><td> 6,0000.00 </td></tr>
      </table>`;

    // Mock axios response
    mockedAxios.get.mockResolvedValue({ data: html });

    // Mock cheerio load and jQuery-like functions
    const mockElement = {
      first: jest.fn().mockReturnThis(),
      next: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnValue(' 6,0000.00 '),
      trim: jest.fn().mockReturnValue('6,0000.00')
    };

    const mockCheerioInstance = jest.fn().mockReturnValue(mockElement);
    mockedCheerio.load.mockReturnValue(mockCheerioInstance as any);

    const price = await fetchIbjaGoldPrice();
    expect(price).toBe(60000);
  });
});