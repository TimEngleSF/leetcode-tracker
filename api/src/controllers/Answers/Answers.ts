import { Request, Response, NextFunction } from 'express';
import { getAnswerFormSchma } from './answersReqSchema';
import Question from '../../models/Question';
import postQuestionService from '../../service/Questions/add-question';
import getQuestionsByUserIdService from '../../service/Questions/get-questions-userId';
import { RequestWithUser } from '../../types/controllerTypes';
import Answer from '../../models/Answer';

const answers = {
    getAnswerSubmitForm: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user;
        const { questId } = req.params;

        const { error } = getAnswerFormSchma.validate({ questId });
        if (error) {
            res.status(422).send({
                message:
                    'A query paramater of questId with a question Id value is required'
            });
        }

        return res.render('Answers/post-answer-form', {
            questId
        });
    },

    postAnswerForm: async (req: Request, res: Response, next: NextFunction) => {
        const { questId, answerCodeInput } = req.body;
        try {
            const answer = new Answer();
            const answerId = await answer.create({
                questId,
                code: answerCodeInput
            });
            if (answerId) {
                res.status(201).send(answerId);
            }
        } catch (error) {
            return next(error);
        }
    },

    // getAnswerById: async (req: Request, res: Response, next: NextFunction) => {
    //     const { answerId } = req.params;
    //     try {
    //         const answer = new Answer();
    //         const answerDocument = await answer.set({ answerId });
    //         return res.status(200).send(answerDocument);
    //     } catch (error) {
    //         next(error);
    //     }
    // },

    getAllAnswersByUserId: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const customReq = req as RequestWithUser;
        const userId = customReq.user.userId;

        try {
            const answerDocuments = await Answer.findAnswersByUserId({
                userId
            });
            return res.status(200).send(answerDocuments);
        } catch (error) {
            next(error);
        }
    }
};
export default answers;
