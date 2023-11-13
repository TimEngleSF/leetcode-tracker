import { Request, Response } from 'express';
import QuestModel from '../../models/Questions/index.js';
// import writeErrorToFile from '../../errors/writeError.js';

export const getQuestion = async (req: Request, res: Response) => {
  const { questId } = req.params;

  try {
    const { code, data } = await QuestModel.getQuestion(questId);
    res.status(code).send(data);
  } catch (error) {
    // await writeErrorToFile(error);
    res.status(404).send(error);
  }
  // res.send(`You are looking for your data on question ${questID}`);
};
