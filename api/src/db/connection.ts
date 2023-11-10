import 'dotenv/config.js';
import { MongoClient, Db, Collection } from 'mongodb';
import { UserDocument } from '../types/userTypes.js';

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

  const client = await MongoClient.connect(URI);

  db = client.db(DB_NAME);
  return db;
};

export const getCollection = async (
  collectionString: 'users' | 'questions' | 'questionData' | 'securityAnswers'
): Promise<Collection | Collection<UserDocument>> => {
  try {
    const db = await connectDb();
    const collection = db.collection(collectionString);
    return collection;
  } catch (error: any) {
    error.statusCode = 500;
    error.message = `Database Error: An error occured while connecting to collection ${collectionString}`;
    throw error;
  }
};

export default connectDb;