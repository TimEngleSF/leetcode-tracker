import express from 'express';
import Controllers from '../controllers/index.js';
const questionsRouter = express.Router();

questionsRouter.get('/', Controllers.Questions.getAllQuestionsByUser);
questionsRouter.get('/:questId', Controllers.Questions.getQuestion);
questionsRouter.get('/review', Controllers.Questions.getReviewQuestions);
questionsRouter.get(
  '/data/:questId',
  Controllers.Questions.subQuestions.getQuestionInfo
);

questionsRouter.post('/add', Controllers.Questions.subQuestions.postQuestion);

export default questionsRouter;
