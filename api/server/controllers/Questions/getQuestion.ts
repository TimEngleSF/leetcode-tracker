import { Request, Response } from 'express';
import QuestModel from '../../models/Questions/index.js';

export const getQuestion = async (req: Request, res: Response) => {
  const { questID } = req.params;

  try {
    const { code, data } = await QuestModel.getQuestion(questID);
    res.status(code).send(data);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
  // res.send(`You are looking for your data on question ${questID}`);
};
