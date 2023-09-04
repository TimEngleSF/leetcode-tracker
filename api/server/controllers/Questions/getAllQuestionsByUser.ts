import { Request, Response } from 'express';
import QuestModel from '../../models/Questions/index.js';

const getAllQuestionsByUser = async (req: Request, res: Response) => {
  const { userID } = req.query;
  if (!userID) {
    res.status(400).send({
      error: 'A userID query is required',
      example: 'http://api/questions/?userID=64f6403f88c5ea582549800d',
    });
  }
  if (typeof userID === 'string') {
    try {
      const { code, data } = await QuestModel.getAllQuestionsByUser(userID);
      res.status(code).send(data);
    } catch (err) {
      res.status(500).send({ message: err });
    }
  }
};

export default getAllQuestionsByUser;
