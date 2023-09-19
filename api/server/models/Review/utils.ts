import { ObjectId } from 'mongodb';
import { getQuestCollection } from '../../db/collections.js';

const convertDaysToMillis = (days: number): number =>
  days * 24 * 60 * 60 * 1000;

export const getReviewQuestionsResults = async (
  userId: string,
  olderThanDays: number,
  newerThanDays: number
) => {
  const questCollection = await getQuestCollection();

  const currentTime = Date.now();
  const olderThan = currentTime - convertDaysToMillis(olderThanDays);
  const newerThan = currentTime - convertDaysToMillis(newerThanDays);

  const results = await questCollection
    .aggregate([
      {
        $match: {
          userID: new ObjectId(userId),
          created: {
            $gt: newerThan,
            $lt: olderThan,
          },
        },
      },
      {
        $sort: {
          created: -1,
        },
      },
      {
        $group: {
          _id: '$questNum',
          mostRecentDocument: { $first: '$$ROOT' },
        },
      },
      {
        $group: {
          _id: null,
          uniqueQuestNums: { $push: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          reviewQuestions: '$uniqueQuestNums',
        },
      },
    ])
    .toArray();

  if (results[0] && results[0].reviewQuestions) {
    return results[0].reviewQuestions;
  } else {
    return [];
  }
};
