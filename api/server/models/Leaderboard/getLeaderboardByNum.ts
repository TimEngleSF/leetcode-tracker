import { Collection, ObjectId } from 'mongodb';
import connectDb from '../../db/connection.js';

import writeErrorToFile from '../../errors/writeError.js';

let questCollection: Collection;
let usersCollection: Collection;

const getCollection = async () => {
  if (questCollection && usersCollection) {
    return;
  }

  const db = await connectDb();
  usersCollection = db.collection('users');
  questCollection = db.collection('questions');
};

getCollection();

export const getLeaderboardByNum = async (questNum: string) => {
  const target = Number.parseInt(questNum);
  try {
    const leaderDataResult = await questCollection
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
            questNum: { $first: '$questNum' },
            passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
            minSpeed: { $min: '$speed' },
            mostRecent: { $max: '$created' },
          },
        },
      ])
      .toArray();

    const sortedResult = leaderDataResult
      .slice()
      .sort((a, b) => b.passedCount - a.passedCount);

    const completeResult = await Promise.all(
      sortedResult.map(async (leaderData) => {
        const userData = await usersCollection.findOne({
          _id: new ObjectId(leaderData._id),
        });

        if (userData) {
          return {
            ...leaderData,
            firstName: userData.firstName,
            lastInit: userData.lastInit,
          };
        }
      })
    );
    console.log(completeResult);

    if (!completeResult) {
      return {
        code: 404,
        data: {
          message: `There is no question with an ID of ${target}`,
        },
      };
    } else {
      return { code: 200, data: completeResult };
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
