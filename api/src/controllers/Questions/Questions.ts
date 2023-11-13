import { Request, Response, NextFunction } from 'express';
import { postQuestionSchema } from './questionReqSchema.js';
import postQuestionService from '../../service/Questions/add-question.js';

const Questions = {
  postQuestion: async (req: Request, res: Response, next: NextFunction) => {
    const { error } = postQuestionSchema.validate(req.body);
    if (error) {
      return res.status(422).send(error.details[0].message);
    }
    try {
      await postQuestionService(req.body);
      console.log('Check, ');
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
export default Questions;
