import express from 'express';
import Controllers from '../controllers/index.js';
const authRouter = express.Router();

authRouter.post('/login', Controllers.Auth.login);
authRouter.post('/register', Controllers.Auth.register);
authRouter.post('/reset', Controllers.Auth.resetPass);

export default authRouter;
