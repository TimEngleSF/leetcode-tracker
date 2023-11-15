import { Document, ObjectId } from 'mongodb';
import Question from '../../models/Question.js';
import { UserDocument } from '../../types/userTypes.js';
import User from '../../models/User.js';
import { ExtendedError } from '../../errors/helpers.js';

// TODO: Setup return type
// TODO: Setup comment code
const getGeneralLeaderBoardService = async (userId: string) => {
  try {
    const leaderResults = await Question.getGeneralLeaderBoard();

    let loggedInUserRank;
    leaderResults.forEach((result, i) => {
      if (result.userId.toHexString() === userId) {
        loggedInUserRank = i + 1;
      }
    });

    const userResults = await Question.getUserLeaderBoardResults(userId);
    const userInfo = await User.getById(userId);
    console.log(userResults, userInfo, userId);
    if (!userResults || !userInfo) {
      const extendedError = new ExtendedError(
        `No question data has been added for user`
      );
      extendedError.statusCode = 404;
      throw extendedError;
    }

    let responseData;
    if (userResults) {
      responseData = {
        userData: {
          userId,
          name: `${userInfo.firstName} ${userInfo.lastInit}`,
          passedCount: userResults.passedCount,
          rank: loggedInUserRank,
        },
        leaderboardData: leaderResults.slice(0, 10),
      };
    } else {
      responseData = {
        userData: null,
        leaderboardData: leaderResults.slice(0, 10),
      };
    }

    return responseData;
  } catch (error: any) {
    throw error;
  }
};

export default getGeneralLeaderBoardService;
