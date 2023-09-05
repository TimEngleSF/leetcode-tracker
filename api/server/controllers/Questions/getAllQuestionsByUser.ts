import { Request, Response } from 'express';
import { createResIncorrectQuery } from './utils.js';

import QuestModel from '../../models/Questions/index.js';

export const getAllQuestionsByUser = async (req: Request, res: Response) => {
  const { userID, question } = req.query;
  if (!userID) {
    const { code, data } = createResIncorrectQuery('userID', 'string');
    res.status(code).send(data);
    return;
  }

  // Get all user Questions
  if (typeof userID === 'string' && !question) {
    try {
      const { code, data } = await QuestModel.getUserQuestionsAll(userID);
      res.status(code).send(data);
      return;
    } catch (err) {
      res.status(500).send({ message: err });
      return;
    }
    // Get user all user Questions with question num
  } else if (typeof userID === 'string' && typeof question === 'string') {
    const questNum = Number.parseInt(question);
    try {
      const { code, data } = await QuestModel.getUserQuestionsByNum(
        userID,
        questNum
      );
      res.status(code).send(data);
      return;
    } catch (err) {
      res.status(500).send({ message: err });
      return;
    }
  }
};
