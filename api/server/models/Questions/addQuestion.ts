import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

import { addQuestIDtoUser } from './utils.js';

let questCollection: Collection;

const getCollection = async () => {
  if (questCollection) {
    return questCollection;
  }

  const db = await connectDb();
  questCollection = db.collection('questions');
};

getCollection();

interface QuestionRequestBody {
  userID: string;
  questNum: number;
  diff: number;
  passed: boolean;
  speed: number;
  memory: number;
}

export const addQuestion = async (body: QuestionRequestBody) => {
  const { userID, questNum, diff, passed, speed, memory } = body;
  const userObjID = new ObjectId(userID);

  try {
    await addQuestIDtoUser(questNum, userObjID);
    const result = await questCollection.insertOne({
      userID: userObjID,
      questNum,
      diff,
      passed,
      speed,
      memory,
      created: Date.now(),
    });

    return { code: 201, data: result };
  } catch (error) {
    return {
      code: 500,
      data: { message: 'There was an error posting the question' },
    };
  }
};
