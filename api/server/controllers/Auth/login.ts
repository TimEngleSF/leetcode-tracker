import { Request, Response } from 'express-serve-static-core';
import { registerSchema } from '../../db/schemas/auth.js';
import AuthModel from '../../models/Auth/index.js';

export const login = async (req: Request, res: Response) => {
  const { body } = req;
  console.log('hello');
  try {
    const { code, data } = await AuthModel.loginUser(body);
    res.status(code).send(data);
  } catch (error) {
    res.status(400).send({ error: error });
  }
};
