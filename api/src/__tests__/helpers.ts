import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import Question from '../models/Question';

interface MockDb {
  db: Db;
  client: MongoClient;
  uri: string;
  mongoServer: MongoMemoryServer;
}

export const createMockDb = async (): Promise<MockDb> => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('lc-test-db');
    User.injectDb(db);
    Question.injectDb(db);
    const MockDb = { db, client, uri, mongoServer };
    return MockDb;
  } catch (error) {
    throw new Error('Cannot to mock db: ${error.message}');
  }
};
