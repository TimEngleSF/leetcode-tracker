import { ObjectId } from 'mongodb';

import {
  getUsersCollection,
  getQuestCollection,
} from '../../db/collections.js';
// import writeErrorToFile from '../../errors/writeError.js';

const questCollection = await getQuestCollection();
const usersCollection = await getUsersCollection();

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
    return { code: 400, error };

    // try {
    //   await writeErrorToFile(
    //     error,
    //     'Error arrised when executing getLeaderboardByNum model'
    //   );
    //   return { code: 400, error };
    // } catch (error) {
    //   return { code: 500, error };
    // }
  }
};
