import { Request, Response } from 'express-serve-static-core';

const getQuestionDataForUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.send(`You are looking for your data on question ${id}`);
};
export default getQuestionDataForUser;
