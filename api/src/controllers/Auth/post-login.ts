import { Request, Response, NextFunction } from 'express';
// import writeErrorToFile from '../../errors/writeError.js';
import loginService from '../../service/Auth/login-user.js';
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;
  try {
    const result = await loginService(username, password);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
