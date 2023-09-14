import { ObjectId } from 'mongodb';

import { getQuestCollection } from '../../db/collections.js';
import writeErrorToFile from '../../errors/writeError.js';

const questCollection = await getQuestCollection();

export const getUserQuestionsAll = async (userID: string) => {
  try {
    const userObjID = new ObjectId(userID);
    const questions = await questCollection
      .find({ userID: userObjID }, { projection: { _id: 0, userID: 0 } })
      .toArray();

    return { code: 200, data: questions };
  } catch (error) {
    await writeErrorToFile(error);
    return { code: 400, data: error };
  }
};
