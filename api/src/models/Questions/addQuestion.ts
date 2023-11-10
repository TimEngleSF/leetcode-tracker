import { ObjectId } from 'mongodb';
// import connectDb from '../../db/connection.js';

import { getQuestCollection } from '../../db/collections.js';
import { addQuestIDtoUser } from './utils.js';
// import writeErrorToFile from '../../errors/writeError.js';

let questCollection = await getQuestCollection();

interface QuestionRequestBody {
  userID: string;
  username: string;
  questNum: number;
  diff: number;
  passed: boolean;
  speed: number;
}

export const addQuestion = async (body: QuestionRequestBody) => {
  const { userID, username, questNum, diff, passed, speed } = body;
  const userObjID = new ObjectId(userID);

  try {
    await addQuestIDtoUser(questNum, userObjID);
    const result = await questCollection.insertOne({
      userID: userObjID,
      username,
      questNum,
      passed,
      speed,
      created: Date.now(),
    });

    return { code: 201, data: result };
  } catch (error) {
    // await writeErrorToFile(error);
    return {
      code: 500,
      data: { message: 'There was an error posting the question' },
    };
  }
};