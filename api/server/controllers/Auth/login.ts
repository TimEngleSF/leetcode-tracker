import { Request, Response } from 'express-serve-static-core';
// import writeErrorToFile from '../../errors/writeError.js';
import AuthModel from '../../models/Auth/index.js';

export const login = async (req: Request, res: Response) => {
  const { body } = req;
  try {
    const { code, data } = await AuthModel.loginUser(body);
    res.status(code).send(data);
  } catch (error) {
    // await writeErrorToFile(error);
    res.status(400).send({ error: error });
  }
};
