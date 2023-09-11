import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

import writeErrorToFile from '../../errors/writeError.js';

let questDataCollection: Collection;

const getCollection = async () => {
  if (questDataCollection) {
    return questDataCollection;
  }

  const db = await connectDb();
  questDataCollection = db.collection('questionData');
};

getCollection();

export const getQuestionData = async (questID: string) => {
  const parsedID = Number.parseInt(questID);
  try {
    const result = await questDataCollection.findOne({ questID: parsedID });
    console.log('result', result);
    if (!result) {
      return {
        code: 400,
        data: { id: questID, message: `No question exists with that id` },
      };
    } else {
      return { code: 200, data: result };
    }
  } catch (error) {
    await writeErrorToFile(error);
    return { code: 400, error };
  }
};
