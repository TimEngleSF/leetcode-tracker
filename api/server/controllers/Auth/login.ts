import { Request, Response } from 'express-serve-static-core';
import { registerSchema } from '../../db/schemas/auth.js';
import AuthModel from '../../models/Auth/index.js';

export const login = async (req: Request, res: Response) => {
  res.send('Hello');
};
