import { Request, Response } from 'express';

import ReviewModel from '../../models/Review/index.js';

export const getReviewQuestions = async (req: Request, res: Response) => {
  try {
    const { userID, olderThan, newerThan } = req.body;
    console.log(userID, olderThan, newerThan);
    const { code, data } = await ReviewModel.getReviewQuestions(
      userID,
      olderThan,
      newerThan
    );
    res.status(200).send('Hello');
  } catch (error) {
    res.status(404).send(error);
  }
};
