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
  // const { body } = req;
  // try {
  //   const { code, data } = await AuthModel.loginUser(body);
  //   res.status(code).send(data);
  // } catch (error) {
  //   // await writeErrorToFile(error);
  //   res.status(400).send({ error: error });
  // }
};
