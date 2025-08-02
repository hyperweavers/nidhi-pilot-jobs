import axios from 'axios';
import Parser from 'rss-parser';
import Sentiment from 'sentiment';
import UserAgent from 'user-agents';

const parser = new Parser();
const sentiment = new Sentiment();

export async function fetchRssSentiment(): Promise<number> {
  const feeds = [
    {
      url: 'https://economictimes.indiatimes.com/rsssymbolfeeds/commodityname-Gold.cms',
    },
    {
      url: 'https://www.business-standard.com/rss/markets/commodities-10608.rss',
      headers: {
        'Accept-Language': 'en-IN',
      },
    },
    {
      url: 'https://indianexpress.com/section/business/commodities/feed/',
    },
    {
      url: 'https://www.thehindubusinessline.com/markets/gold/feeder/default.rss',
    },
    {
      url: 'https://in.investing.com/rss/commodities_Metals.rss',
    },
    {
      url: 'https://www.5paisa.com/rss/news.xml',
    },
    {
      url: 'https://www.commodity-tv.com/ondemand/channel/gold/rss.xml',
    },
    {
      url: 'https://www.commodity-tv.com/ondemand/channel/gold/rss.xml',
    },
    {
      url: 'https://invezz.com/feed/?tag=gold',
    },
    {
      url: 'https://news.google.com/rss/search?q=gold+price+India&hl=en-IN&gl=IN&ceid=IN:en',
    },
  ];
  let totalScore = 0;
  let count = 0;

  for (const { url, headers } of feeds) {
    const feed = await (headers
      ? parser.parseString((await fetchRssFeedAsString(url, headers)).data)
      : parser.parseURL(url));
    for (const item of feed.items) {
      if (
        item.title?.toLowerCase().includes('gold') ||
        item.contentSnippet?.toLowerCase().includes('gold')
      ) {
        const result = sentiment.analyze(
          `${item.title ?? ''}. ${item.contentSnippet ?? ''}`
        );
        totalScore += result.comparative;
        count++;
      }
    }
  }

  return count > 0 ? totalScore / count : 0;
}

async function fetchRssFeedAsString(
  url: string,
  headers: Record<string, string>
) {
  const userAgent = new UserAgent();

  return axios.get(url, {
    headers: {
      'User-Agent': userAgent.random().toString(),
      ...headers,
    },
  });
}

export async function fetchAverageSentiment(): Promise<number> {
  const allScores = [await fetchRssSentiment()];

  return allScores.reduce((a, b) => a + b, 0) / allScores.length;
}
