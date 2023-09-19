import { ObjectId } from 'mongodb';
import { getReviewQuestionsResults } from './utils.js';
import { getQuestCollection } from '../../db/collections.js';

let questCollection = await getQuestCollection();

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
