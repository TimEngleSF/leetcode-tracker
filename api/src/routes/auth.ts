import express from 'express';
import Controllers from '../controllers/index';
import authRateLimiter from '../middleware/authRateLimit';
const authRouter = express.Router();

authRouter.get('/verified/:email', Controllers.Auth.getVerifiedStatus);

authRouter.get('/status', Controllers.Auth.getStatus);

authRouter.post('/login', authRateLimiter, Controllers.Auth.postLogin);

authRouter.post('/register', authRateLimiter, Controllers.Auth.postRegister);

authRouter.get('/verify/:token', Controllers.Auth.getValidateUser);

// Reset Pass endpoints
authRouter.get('/reset', Controllers.Auth.getResetPasswordSendEmail);

authRouter.get('/reset/:token', Controllers.Auth.getResetPasswordForm);

authRouter.post('/reset', Controllers.Auth.postResetPasswordSendEmail);

authRouter.post('/reset-password', Controllers.Auth.postResetPasswordSendEmail);

authRouter.post('/set-password', Controllers.Auth.postResetPasswordForm);

export default authRouter;
