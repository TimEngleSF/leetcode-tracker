import { ObjectId } from 'mongodb';
import { getQuestCollection } from '../../db/collections.js';

const convertDaysToMillis = (days: number): number =>
  days * 24 * 60 * 60 * 1000;

export const getReviewQuestionsResults = async (
  userId: string,
  endOfRangeDays: number,
  startOfRangeDays: number
) => {
  const questCollection = await getQuestCollection();

  const currentTime = Date.now();
  const endOfRangeMillis = currentTime - convertDaysToMillis(endOfRangeDays);
  const startOfRangeMillis =
    currentTime - convertDaysToMillis(startOfRangeDays);

  // Stage 1: Get excluded questNums
  const excludeResults = await questCollection
    .find({
      userID: new ObjectId(userId),
      created: { $gte: endOfRangeMillis },
    })
    .project({ questNum: 1, _id: 0 })
    .toArray();

  const excludeQuestNums = excludeResults.map((doc) => doc.questNum);

  // Stage 2: Actual query
  const results = await questCollection
    .aggregate([
      {
        $match: {
          userID: new ObjectId(userId),
          questNum: { $nin: excludeQuestNums },
          created: {
            $gte: startOfRangeMillis,
            $lte: endOfRangeMillis,
          },
        },
      },
      {
        $sort: { created: -1 },
      },
      {
        $group: { _id: '$questNum' },
      },
      {
        $group: {
          _id: null,
          uniqueQuestNums: { $push: '$_id' },
        },
      },
      {
        $project: { _id: 0, reviewQuestions: '$uniqueQuestNums' },
      },
    ])
    .toArray();

  return results[0]?.reviewQuestions || [];
};
