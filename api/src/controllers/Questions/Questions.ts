import { Request, Response, NextFunction } from 'express';
import {
  postQuestionSchema,
  getQuestionInfoSchema,
  getQuestionsByUserIdSchema,
  getQuestionByIdSchema,
} from './questionReqSchema.js';
import Question from '../../models/Question.js';
import postQuestionService from '../../service/Questions/add-question.js';
import getQuestionsByUserIdService from '../../service/Questions/get-questions-userId.js';
import getReviewQuestionService from '../../service/Questions/get-review-questions.js';

const Questions = {
  getQuestionInfo: async (req: Request, res: Response, next: NextFunction) => {
    const { error } = getQuestionInfoSchema.validate(req.body.questId);
    if (error) {
      return res.status(422).send(error.details[0].message);
    }
    const questId = Number.parseInt(req.params.questId, 10);

    try {
      const result = await Question.getQuestionInfo(questId);
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  },

  getQuestion: async (req: Request, res: Response, next: NextFunction) => {
    const { questId } = req.params;
    const { error } = getQuestionByIdSchema.validate({ questId });
    if (error) {
      return res.status(422).send(error.details[0].message);
    }
    try {
      const result = await Question.getQuestion(questId);
      return res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  },

  getQuestionsByUserId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId, question } = req.query;
    let result;
    const { error } = getQuestionsByUserIdSchema.validate({ userId, question });
    if (error) {
      return res.status(422).send(error.details[0].message);
    }
    if (typeof userId !== 'string') {
      return res.status(422).send('Invalid userId');
    }
    if (question && typeof question !== 'string') {
      return res.status(422).send('Invalid questionId');
    }
    try {
      if (question) {
        const parsedQuestion = Number.parseInt(question, 10);
        result = await getQuestionsByUserIdService(userId, parsedQuestion);
      } else {
        result = await getQuestionsByUserIdService(userId);
      }
    } catch (error) {
      next(error);
    }
    return res.status(200).send(result);
  },

  postQuestion: async (req: Request, res: Response, next: NextFunction) => {
    const { error } = postQuestionSchema.validate(req.body);
    if (error) {
      return res.status(422).send(error.details[0].message);
    }
    try {
      await postQuestionService(req.body);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  getReviewQuestions: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userId }: { userId: string } = (req as any).user;
    // TODO: update to use params
    const { olderThan, newerThan } = req.body;
    try {
      const result = await getReviewQuestionService(
        userId,
        newerThan,
        olderThan
      );
      return res.status(200).send(result);
    } catch (error) {
      throw error;
    }
  },
};
export default Questions;
