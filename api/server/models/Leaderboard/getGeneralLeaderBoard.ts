import { ObjectId } from 'mongodb';

import {
  getGenLeaderboardResults,
  getCompleteTop10Results,
  getUserResults,
} from './utils.js';

export const getGeneralLeaderBoard = async (userId: string) => {
  try {
    const loggedInUserObjID = new ObjectId(userId);

    const leaderResults = await getGenLeaderboardResults();

    if (!leaderResults) {
      return {
        code: 400,
        data: {
          message: `There are no questions added to the database yet!\nPlease add the first question.`,
        },
      };
    }

    const top10Data = await getCompleteTop10Results(
      loggedInUserObjID,
      leaderResults
    );

    const userResults = await getUserResults(loggedInUserObjID);
    console.log(userResults);

    const responseData = {
      userData: {
        userId: userResults.userId,
        name: userResults.name,
        passedCount: userResults.passedCount,
        rank: top10Data.loggedInUserRank,
      },
      leaderboardData: top10Data.completeTop10Results,
    };

    return { code: 200, data: responseData };
  } catch (error) {
    return { code: 400, error };
  }
};
