import { Request, Response } from 'express';
import { addQuestionSchema } from '../../db/schemas/questions.js';
import QuestModel from '../../models/Questions/index.js';

export const addQuestionData = async (req: Request, res: Response) => {
  const { body } = req;
  const { error } = addQuestionSchema.validate(body);

  if (error) {
    res.status(400).send(error.message);
    return;
  }

  try {
    const { code, data } = await QuestModel.addQuestion(body);
    res.status(code).send(data);
  } catch (error) {}
};
