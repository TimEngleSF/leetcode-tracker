import { Request, Response } from 'express-serve-static-core';

const getReviewQuestions = async (req: Request, res: Response) => {
  res.send(
    'You are looking for questions to review, here is the url to it as well'
  );
};

export default getReviewQuestions;
