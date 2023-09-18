import { ObjectId, Document } from 'mongodb';
import {
  getQuestCollection,
  getUsersCollection,
} from '../../db/collections.js';

const questCollection = await getQuestCollection();
const usersCollection = await getUsersCollection();

export const getGenLeaderboardResults = async () => {
  const results = await questCollection
    .aggregate([
      {
        $group: {
          _id: '$userID',
          passedCount: {
            $sum: {
              $cond: [
                {
                  $eq: ['$passed', true],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])
    .toArray();

  return results;
};

export const getCompleteTop10Results = async (
  loggedInUserId: ObjectId,
  leaderResults: Document[]
) => {
  const completeTop10Results = await Promise.all(
    leaderResults
      .sort((a, b) => b.passedCount - a.passedCount)
      .map(async (userResults) => {
        const userObjID = new ObjectId(userResults._id);
        const userData = await usersCollection.findOne({ _id: userObjID });

        if (userData === null) {
          throw new Error(`User with ID ${userObjID} not found`);
        }

        return {
          userID: userResults._id,
          name: `${userData.firstName} ${userData.lastInit}.`,
          passedCount: userResults.passedCount,
          lastActivity: userData.lastActivity,
        };
      })
  );
  let loggedInUserRank;
  completeTop10Results.forEach((result, i) => {
    if (result.userID.toHexString() === loggedInUserId.toHexString()) {
      loggedInUserRank = i + 1;
    }
  });

  return {
    loggedInUserRank,
    completeTop10Results,
  };
};

export const getUserResults = async (loggedInUserId: ObjectId) => {
  const userResults = await questCollection
    .aggregate([
      {
        $match: {
          userID: loggedInUserId,
          passed: true,
        },
      },
      {
        $group: {
          _id: '$userID',
          passedCount: {
            $sum: {
              $cond: [
                {
                  $eq: ['$passed', true],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])
    .toArray();

  const userInfo = await usersCollection.findOne({ _id: loggedInUserId });
  if (!userResults || !userInfo) {
    throw new Error(`No question data has been added for user`);
  }
  return {
    userId: loggedInUserId.toHexString(),
    name: `${userInfo.firstName} ${userInfo.lastInit}`,
    passedCount: userResults[0].passedCount,
  };
};
