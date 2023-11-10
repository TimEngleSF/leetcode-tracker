import { Request, Response, NextFunction } from 'express';
// import writeErrorToFile from '../../errors/writeError.js';
import loginService from '../../service/Auth/login-user.js';
import { loginReqSchema, registerReqSchema } from './authReqSchemas.js';
import User from '../../models/User.js';
import registerUserService from '../../service/Auth/register-user.js';
import validateUserService from '../../service/Auth/validate-user.js';

const Auth = {
  postLogin: async (req: Request, res: Response, next: NextFunction) => {
    let { error } = loginReqSchema.validate(req.body);
    if (error) {
      res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    const { username, password } = req.body;
    try {
      const result = await loginService(username, password);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  },

  postRegister: async (req: Request, res: Response, next: NextFunction) => {
    let { error } = registerReqSchema.validate(req.body);
    if (error) {
      res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    const { username, email, password, firstName, lastInit } = req.body;

    try {
      const result = await registerUserService({
        displayUsername: username,
        email,
        password,
        firstName,
        lastInit,
      });
      return res.status(201).send(result);
    } catch (error) {
      return next(error);
    }
  },

  getValidateUser: async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    const { success, firstName, username } = await validateUserService(token);
    if (!success) {
      return res.render('validate-user-error');
    }

    res.render('validate-user', { firstName, username });
  },
};

export default Auth;
