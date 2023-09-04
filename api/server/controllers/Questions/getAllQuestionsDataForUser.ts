import { Request, Response } from 'express-serve-static-core';

const getAllQuestionsDataForUser = async (req: Request, res: Response) => {
  res.send(`You are looking for data on all of your questions`);
};

export default getAllQuestionsDataForUser;
