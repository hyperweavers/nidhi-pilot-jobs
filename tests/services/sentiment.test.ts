// Mock the modules before importing
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockResolvedValue({
      items: [{ title: 'bullish gold' }, { title: 'bearish trend' }]
    })
  }));
});

jest.mock('sentiment', () => {
  return jest.fn().mockImplementation(() => ({
    analyze: jest.fn((text: string) => ({
      score: text.includes('bullish') ? 2 : -1
    }))
  }));
});

import { fetchAverageSentiment } from '../../src/services/sentiment';

describe('fetchAverageSentiment', () => {
  it('computes average correctly', async () => {
    const avg = await fetchAverageSentiment();
    // two feeds × 2 items each = 4 items, total score = (2 + -1) * 2 = 2
    expect(avg).toBe(0.5);
  });

  it('returns 0 when no items have titles', async () => {
    // Mock with items that have no titles
    jest.clearAllMocks();
    
    jest.mock('rss-parser', () => {
      return jest.fn().mockImplementation(() => ({
        parseURL: jest.fn().mockResolvedValue({
          items: [{ title: null }, { title: undefined }]
        })
      }));
    });

    jest.mock('sentiment', () => {
      return jest.fn().mockImplementation(() => ({
        analyze: jest.fn()
      }));
    });

    // Re-import to get the new mocks
    jest.resetModules();
    const { fetchAverageSentiment: fetchAverageSentimentNew } = await import('../../src/services/sentiment');
    
    const avg = await fetchAverageSentimentNew();
    expect(avg).toBe(0);
  });
});