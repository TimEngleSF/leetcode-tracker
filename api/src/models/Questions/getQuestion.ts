import { ObjectId } from 'mongodb';
import { getQuestCollection } from '../../db/collections.js';

// import writeErrorToFile from '../../errors/writeError.js';

const questCollection = await getQuestCollection();

export const getQuestion = async (questID: string) => {
  const questObjID = new ObjectId(questID);
  try {
    const result = await questCollection.findOne({ _id: questObjID });
    if (!result) {
      return {
        code: 400,
        data: { id: questID, message: `No question exists with that id` },
      };
    } else {
      return { code: 200, data: result };
    }
  } catch (error) {
    // await writeErrorToFile(error);
    return { code: 400, error };
  }
};
