import Question from '../../models/Question.js';
import { GeneralLeaderboardServiceReturn } from '../../types/questionTypes.js';

const getGeneralLeaderBoardService = async (
  userId: string
): Promise<GeneralLeaderboardServiceReturn> => {
  try {
    // Query DB for leaderboard and users results
    const { leaderboardResult, userResult } =
      await Question.getGeneralLeaderBoard(userId);

    //Get the logged in user's rank
    let loggedInUserRank;
    leaderboardResult.forEach((result, i) => {
      if (result.userId.toHexString() === userId) {
        loggedInUserRank = i + 1;
      }
    });

    let responseData;
    // Build response data based on user's passed count
    // TODO: update the front end to display to handle if user's passed count is 0 so else statementso we can always
    // send the first conditions responseData
    if (userResult.passedCount > 0) {
      responseData = {
        userData: {
          ...userResult,
          rank: loggedInUserRank,
        },
        leaderboardData: leaderboardResult.slice(0, 10),
      };
    } else {
      responseData = {
        userData: null,
        leaderboardData: leaderboardResult.slice(0, 10),
      };
    }

    return responseData;
  } catch (error: any) {
    throw error;
  }
};

export default getGeneralLeaderBoardService;
