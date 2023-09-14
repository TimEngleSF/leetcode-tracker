import { getQuestInfoCollection } from '../../db/collections.js';
import writeErrorToFile from '../../errors/writeError.js';

const questDataCollection = await getQuestInfoCollection();

export const getQuestionData = async (questID: string) => {
  const parsedID = Number.parseInt(questID);
  try {
    const result = await questDataCollection.findOne({ questID: parsedID });
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
