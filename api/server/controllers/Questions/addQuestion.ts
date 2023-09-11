import { Request, Response } from 'express';
import { addQuestionSchema } from '../../db/schemas/questions.js';
import QuestModel from '../../models/Questions/index.js';
import writeErrorToFile from '../../errors/writeError.js';

export const addQuestion = async (req: Request, res: Response) => {
  const { body } = req;
  const { error } = addQuestionSchema.validate(body);
  if (error) {
    await writeErrorToFile(error);
    res.status(400).send(error);
    return;
  }

  try {
    const { code, data } = await QuestModel.addQuestion(body);
    res.status(code).send(data);
  } catch (error: any) {
    await writeErrorToFile(error);
  }
};
