import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

import writeErrorToFile from '../../errors/writeError.js';

let questCollection: Collection;

const getCollection = async () => {
  if (questCollection) {
    return questCollection;
  }

  const db = await connectDb();
  questCollection = db.collection('questions');
};

getCollection();

export const getLeaderboardByNum = async (questNum: string) => {
  const target = Number.parseInt(questNum);
  try {
    const result = await questCollection
      .aggregate([
        {
          $match: {
            questNum: target,
            passed: true,
          },
        },
        {
          $sort: {
            created: -1,
          },
        },
        {
          $group: {
            _id: '$userID',
            passedCount: { $sum: { $cond: ['$passed', 1, 0] } }, // Count of passed: true
            minSpeed: { $min: '$speed' }, // Minimum speed
            mostRecent: { $max: '$created' }, // Most recent creation date
          },
        },
      ])
      .toArray();
    if (!result) {
      return {
        code: 404,
        data: {
          message: `There is no question with an ID of ${target}`,
        },
      };
    } else {
      return { code: 200, data: result };
    }
  } catch (error) {
    try {
      await writeErrorToFile(
        error,
        'Error arrised when executing getLeaderboardByNum model'
      );
      return { code: 400, error };
    } catch (error) {
      return { code: 500, error };
    }
  }
};
