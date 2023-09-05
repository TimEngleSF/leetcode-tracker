import { Request, Response } from 'express';
import AuthModel from '../../models/Auth/index.js';

export const resetPass = async (req: Request, res: Response) => {
  res.send('Reset Password');
};
