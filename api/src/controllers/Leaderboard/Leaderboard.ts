import { Request, Response, NextFunction } from 'express';
import { getQuestionLeaderboardSchema } from './leaderboardReqSchema';
import Question from '../../models/Question';

const Leaderboard = {
    getGeneralLeaderboard: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const userId = (req as any).user.userId;
        const { groupId } = req.query;
        try {
            const result = await Question.getGeneralLeaderboard(
                userId,
                groupId?.toString()
            );
            return res.status(200).send({
                user: result.userResult,
                leaderboard: result.leaderboardResult.slice(0, 10)
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
            questId: req.params.questId
        });
        const { groupId } = req.query;
        if (error) {
            return res.status(422).send(error.details[0].message);
        }

        const targetQuestion = Number.parseInt(req.params.questId, 10);
        try {
            const result = await Question.getQuestionLeaderboard(
                userId,
                targetQuestion,
                sort === 'speed',
                groupId?.toString()
            );

            if (typeof result === 'string') {
                return res.status(404).send({ message: result });
            }
            return res.status(200).send({
                user: result.userResult,
                leaderboard: result.leaderboardResult.slice(0, 10)
            });
        } catch (error) {
            next(error);
        }
    }
};

export default Leaderboard;
