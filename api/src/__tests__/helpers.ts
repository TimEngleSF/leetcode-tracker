import fs from 'fs/promises';
import path from 'path';
import { Db, MongoClient, ObjectId } from 'mongodb';
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

    const questionDataJsonPath = path.join(__dirname, 'questionInfo.json');

    const questionDataJson = JSON.parse(
      await fs.readFile(questionDataJsonPath, 'utf-8')
    );
    const transformedData = questionDataJson.map((item: any) => {
      if (item._id && item._id.$oid) {
        return { ...item, _id: new ObjectId(item._id.$oid) };
      }
      return item;
    });

    if ((await db.collection('questionData').countDocuments()) === 0) {
      await db.collection('questionData').insertMany(transformedData);
    }

    const MockDb = { db, client, uri, mongoServer };
    return MockDb;
  } catch (error: any) {
    throw new Error(`Cannot to mock db: ${error.message}`);
  }
};
