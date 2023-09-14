import { Collection } from 'mongodb';
import connectDb from './connection.js';

let usersData: Collection;
let questData: Collection;
let questInfoData: Collection;

export const getUsersCollection = async () => {
  if (usersData) {
    return usersData;
  }
  try {
    const db = await connectDb();
    usersData = db.collection('users');
    return usersData;
  } catch (error) {
    console.error('Could not connect to users collection:', error);
    throw new Error('Database connection failed');
  }
};

export const getQuestCollection = async () => {
  if (questData) {
    return questData;
  }
  try {
    const db = await connectDb();
    questData = db.collection('questions');
    return questData;
  } catch (error) {
    console.error('Could not connect to questions collection:', error);
    throw new Error('Database connection failed');
  }
};

export const getQuestInfoCollection = async () => {
  if (questInfoData) {
    return questInfoData;
  }
  try {
    const db = await connectDb();
    questInfoData = db.collection('questionData');
    return questInfoData;
  } catch (error) {
    console.error('Could not connect to questionData collection:', error);
    throw new Error('Database connection failed');
  }
};
