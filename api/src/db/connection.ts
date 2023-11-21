import 'dotenv/config.js';
import { MongoClient, Db, Collection, Document, ClientSession } from 'mongodb';
import { ExtendedError } from '../errors/helpers';

let client: MongoClient | undefined;
let db: Db;

const DB_NAME =
  process.env.NODE_ENV === 'dev' ? 'test' : process.env.DB_NAME || 'lc-tracker';
const URI = process.env.URI;

const connectDb = async () => {
  if (URI === undefined) {
    throw new ExtendedError('env file missing mongoDb URI');
  }
  if (db) {
    return db;
  }

  client = await MongoClient.connect(URI);

  db = client.db(DB_NAME);
  return db;
};

export const getCollection = async <T extends Document>(
  collectionName: 'users' | 'blacklistTokens' | 'questions' | 'questionData'
): Promise<Collection<T>> => {
  try {
    const db = await connectDb();
    const collection = db.collection<T>(collectionName);
    return collection;
  } catch (error: any) {
    error.statusCode = 500;
    error.message = `Database Error: An error occured while connecting to collection ${collectionName}`;
    throw error;
  }
};

export const closeDb = async () => {
  if (client) {
    try {
      await client.close();
    } catch (error) {
      console.error('Error closing the database connection:', error);
    }
  }
};

export default connectDb;
