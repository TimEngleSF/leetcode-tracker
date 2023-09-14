import { Collection, ObjectId } from 'mongodb';

import { getUsersCollection } from '../../db/collections.js';
import writeErrorToFile from '../../errors/writeError.js';

const usersCollection = await getUsersCollection();

// Functions
export const addQuestIDtoUser = async (questNum: number, userId: ObjectId) => {
  try {
    const data = await usersCollection.findOne(
      { _id: userId },
      { projection: { questions: 1 } }
    );
    if (data !== null) {
      const { questions } = data;
      if (questions.includes(questNum)) {
        return;
      }

      await usersCollection.updateOne(
        { _id: userId },
        { $push: { questions: questNum } }
      );
    }
  } catch (error) {
    await writeErrorToFile(error);
  }
};
