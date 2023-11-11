import express from 'express';
import Controllers from '../controllers/index.js';
const authRouter = express.Router();

authRouter.post('/login', Controllers.Auth.SubAuth.postLogin);

authRouter.post('/register', Controllers.Auth.SubAuth.postRegister);

authRouter.put('/reset', Controllers.Auth.resetPass);

authRouter.get('/verify/:token', Controllers.Auth.SubAuth.getValidateUser);

authRouter.post('/validate', Controllers.Auth.validateSecAnswer);

authRouter.get('/reset', Controllers.Auth.SubAuth.getResetPasswordSendEmail);

authRouter.get('/reset/:token', Controllers.Auth.SubAuth.getResetPasswordForm);

authRouter.post('/reset', Controllers.Auth.SubAuth.postResetPasswordSendEmail);
authRouter.post(
  '/reset-password',
  Controllers.Auth.SubAuth.postResetPasswordSendEmail
);

authRouter.post(
  '/set-password',
  Controllers.Auth.SubAuth.postResetPasswordForm
);

export default authRouter;
