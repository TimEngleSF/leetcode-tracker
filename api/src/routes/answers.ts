import express from 'express';
import Controllers from '../controllers/index';
import authRateLimiter from '../middleware/authRateLimit';
import isAuth from '../middleware/isAuth';
const answerRoutes = express.Router();

answerRoutes.get('/form/:questId', Controllers.answers.getAnswerSubmitForm);

answerRoutes.get(
    '/user-answers',
    isAuth,
    Controllers.answers.getAllAnswersByUserId
);

answerRoutes.post('/form', Controllers.answers.postAnswerForm);

export default answerRoutes;
