import express from 'express';
import Controllers from '../controllers/index';
const questionsRouter = express.Router();

questionsRouter.get('/', Controllers.Questions.getQuestionsByUserId);

questionsRouter.get('/review', Controllers.Questions.getReviewQuestions);

questionsRouter.get('/data/:questId', Controllers.Questions.getQuestionInfo);

questionsRouter.get('/:questId', Controllers.Questions.getQuestion);

questionsRouter.post('/add', Controllers.Questions.postQuestion);

export default questionsRouter;
