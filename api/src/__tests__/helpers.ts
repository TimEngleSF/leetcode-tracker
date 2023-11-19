import fs from 'fs/promises';
import path from 'path';
import { Db, MongoClient, ObjectId, Document } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import Question from '../models/Question';
import { UserDocument } from '../types';
import { QuestionDocument, QuestionInfoDocument } from '../types/questionTypes';
import { json } from 'stream/consumers';

interface MockDb {
  db: Db;
  client: MongoClient;
  uri: string;
  mongoServer: MongoMemoryServer;
}

const convertFields = (data: Document[]) => {
  return data.map((item) => {
    let newItem = { ...item };

    // Convert _id field
    if (newItem._id && typeof newItem._id === 'string') {
      newItem._id = new ObjectId(newItem._id);
    }

    // convert userId field
    if (newItem.userId && typeof newItem.userId === 'string') {
      newItem.userId = new ObjectId(newItem.userId);
    }

    // Convert date fields
    if (newItem.lastActivity && newItem.lastActivity['$date']) {
      newItem.lastActivity = new Date(newItem.lastActivity['$date']);
    }

    if (newItem.created && newItem.created['$date']) {
      newItem.created = new Date(newItem.created['$date']);
    }

    // Add other fields here if needed

    return newItem;
  });
};

export const createMockDb = async (): Promise<MockDb> => {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('lc-test-db');
    User.injectDb(db);
    Question.injectDb(db);

    // Insert User documents into MongoMemoryServer
    const usersJsonPath = path.join(__dirname, 'users.json');
    let users = JSON.parse(await fs.readFile(usersJsonPath, 'utf-8'));

    users = convertFields(users);

    if ((await db.collection('users').countDocuments()) === 0) {
      await db.collection('users').insertMany(users);
    }
    // Insert Question documents into MongoMemoryServer
    const questionsPath = path.join(__dirname, 'questions.json');
    let questionsDocuments = JSON.parse(
      await fs.readFile(questionsPath, 'utf-8')
    );
    questionsDocuments = convertFields(questionsDocuments);

    if ((await db.collection('questions').countDocuments()) === 0) {
      await db.collection('questions').insertMany(questionsDocuments);
    }

    // Insert QuestionInfo documents into MongoMemoryServer
    const questionDataJsonPath = path.join(__dirname, 'questionInfo.json');
    let questionInfoDocuments = JSON.parse(
      await fs.readFile(questionDataJsonPath, 'utf-8')
    );

    questionInfoDocuments = convertFields(questionInfoDocuments);

    if ((await db.collection('questionData').countDocuments()) === 0) {
      await db.collection('questionData').insertMany(questionInfoDocuments);
    }

    const MockDb = { db, client, uri, mongoServer };
    return MockDb;
  } catch (error: any) {
    throw new Error(`Cannot to mock db: ${error.message}`);
  }
};
