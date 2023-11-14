import express from 'express';
import Controllers from '../controllers/index.js';
const questionsRouter = express.Router();

questionsRouter.get(
  '/',
  Controllers.Questions.subQuestions.getQuestionsByUserId
);

questionsRouter.get(
  '/review',
  Controllers.Questions.subQuestions.getReviewQuestions
);

questionsRouter.get(
  '/data/:questId',
  Controllers.Questions.subQuestions.getQuestionInfo
);

questionsRouter.get(
  '/:questId',
  Controllers.Questions.subQuestions.getQuestion
);
questionsRouter.post('/add', Controllers.Questions.subQuestions.postQuestion);

export default questionsRouter;
