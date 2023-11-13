import { getQuestInfoCollection } from '../../db/collections.js';
// import writeErrorToFile from '../../errors/writeError.js';

const questDataCollection = await getQuestInfoCollection();

export const getQuestionData = async (questId: string) => {
  const parsedId = Number.parseInt(questId);
  try {
    const result = await questDataCollection.findOne({ questId: parsedId });
    if (!result) {
      return {
        code: 400,
        data: { id: questId, message: `No question exists with that id` },
      };
    } else {
      return { code: 200, data: result };
    }
  } catch (error) {
    // await writeErrorToFile(error);
    return { code: 400, error };
  }
};
