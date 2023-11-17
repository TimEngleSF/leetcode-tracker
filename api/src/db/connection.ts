import 'dotenv/config.js';
import { MongoClient, Db, Collection, Document, ClientSession } from 'mongodb';
import { UserDocument } from '../types/userTypes.js';
import { BlacklistDocument } from '../types/blacklistTypes.js';
import { QuestionDocument } from '../types/questionTypes.js';

let client: MongoClient | undefined;
let db: Db;

// const USERNAME = encodeURIComponent(process.env.DB_USER);
// const PASSWORD = encodeURIComponent(process.env.DB_PASS);
const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || '27017';
const DB_NAME = process.env.DB_NAME || 'lc-tracker';
// const DB_AUTHCOLL = process.env.DB_AUTHCOLL || 'admin';
// const URI = `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/?authMechanism=DEFAULT&authSource=${DB_AUTHCOLL}`;
const URI = process.env.URI || 'mongodb://localhost:27017';

const connectDb = async () => {
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
