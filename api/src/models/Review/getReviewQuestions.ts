import { getReviewQuestionsResults } from './utils.js';
import { getQuestInfoCollection } from '../../db/collections.js';

export const getReviewQuestions = async (
  userID: string,
  olderThanDays: number,
  newerThanDays: number
) => {
  try {
    const questInfoCollection = await getQuestInfoCollection();
    const questionResults = await getReviewQuestionsResults(
      userID,
      olderThanDays,
      newerThanDays
    );

    const questionsData = await Promise.all(
      questionResults.map(
        async (quest: number) =>
          await questInfoCollection.findOne({ questId: quest })
      )
    );

    if (questionsData.length > 0) {
      return { code: 200, data: questionsData };
    } else {
      return {
        code: 404,
        data: `User has no questions to review meeting criteria`,
      };
    }
  } catch (error) {
    return { code: 400, data: `There was an error` };
  }
};
