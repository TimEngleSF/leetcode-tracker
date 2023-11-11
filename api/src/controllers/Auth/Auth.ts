import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// import writeErrorToFile from '../../errors/writeError.js';
import loginService from '../../service/Auth/login-user.js';
import { loginReqSchema, registerReqSchema } from './authReqSchemas.js';
import User from '../../models/User.js';
import registerUserService from '../../service/Auth/register-user.js';
import validateUserService from '../../service/Auth/validate-user.js';
import setPasswordTokenService from '../../service/Auth/set-password-token.js';

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
      return res.render('Auth/verify/verify-user-error');
    }

    res.render('Auth/verify/verify-user', { firstName, username });
  },

  getResetPasswordSendEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.render('Auth/password/account-lookup');
  },

  postResetPasswordSendEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { email } = req.body;
    try {
      await setPasswordTokenService(email);
      res.render('Auth/password/token-set');
    } catch (error) {
      console.log(error);
      res.render('Auth/password/token-set');
    }
  },

  getResetPasswordForm: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { token } = req.params;
    const { PASSWORD_VERIFICATION_SECRET } = process.env;
    try {
      if (!PASSWORD_VERIFICATION_SECRET) {
        throw new Error();
      }
      jwt.verify(token, PASSWORD_VERIFICATION_SECRET);
      const userDocument = await User.getByPasswordToken(token);
      if (!userDocument) {
        throw new Error();
      }
    } catch (error) {
      return res.render('Auth/password/invalid-reset-password');
    }
    return res.render('Auth/password/reset-password', {
      token,
      validPassword: true,
      message: null,
    });
  },

  postResetPasswordForm: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // TODO: Add functionality to reset password, remember to check if passwords match
    // confirm passwords match if not set correct message,
    // confirm password is of valid length, if not set correct message
    // if either of these fail redirect them to getResetPasswordForm using the token that is passed from the from
  },
};

export default Auth;
