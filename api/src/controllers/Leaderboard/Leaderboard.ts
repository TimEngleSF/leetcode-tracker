import { Request, Response, NextFunction } from 'express';
import { getQuestionLeaderboardSchema } from './leaderboardReqSchema.js';
import Question from '../../models/Question.js';

const Leaderboard = {
  getGeneralLeaderboard: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = (req as any).user.userId;

    try {
      const result = await Question.getGeneralLeaderboard(userId);
      return res.status(200).send({
        user: result.userResult,
        leaderboard: result.leaderboardResult.slice(0, 10),
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
    const userId = (req as any).user.userId;
    const { sort } = req.query;
    const { error } = getQuestionLeaderboardSchema.validate({
      questId: req.params.questId,
    });

    if (error) {
      return res.status(422).send(error.details[0].message);
    }

    const targetQuestion = Number.parseInt(req.params.questId, 10);
    try {
      const { userResult, leaderboardResult } =
        await Question.getQuestionLeaderboard(
          userId,
          targetQuestion,
          sort === 'speed'
        );
      return res.status(200).send({
        user: userResult,
        leaderboard: leaderboardResult.slice(0, 10),
      });
    } catch (error) {
      next(error);
    }
  },
};

export default Leaderboard;
