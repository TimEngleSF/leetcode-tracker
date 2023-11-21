import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import loginService from '../../service/Auth/login-user';
import { loginReqSchema, registerReqSchema } from './authReqSchemas';
import User from '../../models/User';
import registerUserService from '../../service/Auth/register-user';
import validateUserService from '../../service/Auth/validate-user';
import setPasswordTokenService from '../../service/Auth/set-password-token';
import Blacklist from '../../models/Blacklist';
import setNewPasswordService from '../../service/Auth/set-new-password';
import { UserToken } from '../../types/userTypes';

const Auth = {
  getStatus: async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      return res.status(422).send({ status: 'invalid' });
    }
    const token = authHeader?.split(' ')[1];
    const { JWT_SECRET } = process.env;
    if (!JWT_SECRET) {
      return res.status(422).send({ status: 'invalid' });
    }
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET) as UserToken;
      const user = await User.getById(decodedToken.userId);
      if (!user) {
        throw new Error();
      }
    } catch (error) {
      return res.status(401).send({ status: 'invalid' });
    }
    return res.status(200).send({ status: 'valid' });
  },

  postLogin: async (req: Request, res: Response, next: NextFunction) => {
    let { error } = loginReqSchema.validate(req.body);
    if (error) {
      res
        .status(422)
        .send({ message: 'Validation Error', error: error.details[0].message });
    }
    const { email, password } = req.body;
    try {
      const result = await loginService(email, password);
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
      const [userDocument, blacklistDocument] = await Promise.all([
        User.getByPasswordToken(token),
        Blacklist.findByToken(token),
      ]);
      if (!userDocument || blacklistDocument) {
        throw new Error('A user could not be found, or token is blacklisted');
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
    const { password, token } = req.body;
    try {
      await setNewPasswordService(password, token);
      return res.render('Auth/password/reset-password-success');
    } catch (error) {
      res.redirect(`/reset/${token}`);
    }
  },
};

export default Auth;
