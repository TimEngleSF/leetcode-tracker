import { Request, Response } from 'express';

import ReviewModel from '../../models/Review/index.js';

export const getReviewQuestions = async (req: Request, res: Response) => {
  try {
    const userID = (req as any).user.userId;
    const { olderThan, newerThan } = req.body;

    const { code, data } = await ReviewModel.getReviewQuestions(
      userID,
      olderThan,
      newerThan
    );
    res.status(code).send(data);
  } catch (error) {
    res.status(404).send(error);
  }
};
