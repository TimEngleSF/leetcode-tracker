import express from 'express';
import Controllers from '../controllers/index.js';
const authRouter = express.Router();

authRouter.post('/login', Controllers.Auth.postLogin);

authRouter.post('/register', Controllers.Auth.postRegister);

authRouter.get('/verify/:token', Controllers.Auth.getValidateUser);

authRouter.get('/reset', Controllers.Auth.getResetPasswordSendEmail);

authRouter.get('/reset/:token', Controllers.Auth.getResetPasswordForm);

authRouter.post('/reset', Controllers.Auth.postResetPasswordSendEmail);
authRouter.post('/reset-password', Controllers.Auth.postResetPasswordSendEmail);

authRouter.post('/set-password', Controllers.Auth.postResetPasswordForm);

export default authRouter;
