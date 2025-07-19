import axios from 'axios';
import cheerio from 'cheerio';
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
      url: 'https://news.google.com/rss/search?q=gold+price+India&hl=en-IN&gl=IN&ceid=IN:en',
    },

    // 'https://twitrss.me/twitter_search_to_rss.php?term=gold+price+india',
  ];
  let totalScore = 0;
  let count = 0;

  for (const { url, headers } of feeds) {
    const feed = await (headers
      ? parser.parseString((await fetchRssFeedAsString(url, headers)).data)
      : parser.parseURL(url));
    for (const item of feed.items) {
      if (item.title) {
        const result = sentiment.analyze(item.title);
        totalScore += result.score;
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

export async function fetchYahooFinanceSentiment(): Promise<number> {
  const { data } = await axios.get(
    'https://finance.yahoo.com/topic/commodities'
  );
  const $ = cheerio.load(data);
  const headlines: string[] = [];

  $('h3, h2, a').each((_, el) => {
    const text = $(el).text().trim();
    if (text.toLowerCase().includes('gold')) {
      headlines.push(text);
    }
  });

  let total = 0;
  headlines.slice(0, 10).forEach((text) => {
    const score = sentiment.analyze(text).score;
    total += score;
  });

  return headlines.length ? total / headlines.length : 0;
}

export async function fetchAverageSentiment(): Promise<number> {
  const allScores = [
    await fetchRssSentiment(),
    // await fetchYahooFinanceSentiment(),
  ];

  return allScores.reduce((a, b) => a + b, 0) / allScores.length;
}
