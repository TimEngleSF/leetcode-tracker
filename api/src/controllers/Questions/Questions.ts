import { Request, Response, NextFunction } from 'express';
import {
  postQuestionSchema,
  getQuestionInfoSchema,
} from './questionReqSchema.js';
import Question from '../../models/Question.js';
import postQuestionService from '../../service/Questions/add-question.js';

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
};
export default Questions;
