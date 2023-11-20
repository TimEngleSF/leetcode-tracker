import { Request, Response, NextFunction } from 'express';
import { getQuestionLeaderboardSchema } from './leaderboardReqSchema.js';
import getGeneralLeaderBoardService from '../../service/Leaderboard/get-general-leaderboard.js';
import Question from '../../models/Question.js';

const Leaderboard = {
  getGeneralLeaderboard: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = (req as any).user.userId;

    try {
      const result = await Question.getGeneralLeaderBoard(userId);
      return res.status(200).send({
        userResult: result.userResult,
        leaderboardResults: result.leaderboardResult.slice(0, 10),
      });
    } catch (error) {
      next(error);
    }
  },

  getQuestionLeaderboard: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { error } = getQuestionLeaderboardSchema.validate({
      questId: req.params.questId,
    });
    if (error) {
      return res.status(422).send(error.details[0].message);
    }

    const targetQuestion = Number.parseInt(req.params.questId, 10);

    try {
      const result = await Question.getQuestionLeaderboard(targetQuestion);
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  },
};

export default Leaderboard;
