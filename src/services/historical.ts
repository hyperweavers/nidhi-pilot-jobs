import { MongoClient } from 'mongodb';

import { HistoricalRate } from '../types';

const DB_URL = process.env.DB_URL || '';
const DB_NAME = process.env.DB_NAME || '';
const DB_COLLECTION = process.env.DB_COLLECTION || '';

export async function fetchHistoricalRates(): Promise<HistoricalRate[]> {
  const client = new MongoClient(DB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(DB_COLLECTION);

    const records = await collection.find({}).toArray();

    return records.map((record: any) => ({
      date: record.date ? new Date(record.date) : null,
      retailPrice: +record.retailPrice || 0,
      marketPrice: +record.marketPrice || 0,
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error querying retail price: ${JSON.stringify(error)}`);

    return [];
  } finally {
    await client.close();
  }
}
