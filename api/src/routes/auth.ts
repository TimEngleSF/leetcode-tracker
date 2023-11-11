import express from 'express';
import Controllers from '../controllers/index.js';
const authRouter = express.Router();

authRouter.post('/login', Controllers.Auth.SubAuth.postLogin);
authRouter.post('/register', Controllers.Auth.SubAuth.postRegister);
authRouter.put('/reset', Controllers.Auth.resetPass);
authRouter.get('/verify/:token', Controllers.Auth.SubAuth.getValidateUser);
authRouter.post('/validate', Controllers.Auth.validateSecAnswer);

export default authRouter;
