import { getReviewQuestionsResults } from './utils.js';

export const getReviewQuestions = async (
  userID: string,
  olderThanDays: number,
  newerThanDays: number
) => {
  const results = await getReviewQuestionsResults(
    userID,
    olderThanDays,
    newerThanDays
  );
  console.log(results);
};
