import express from 'express';
import Controllers from '../controllers/index';
const questionsRouter = express.Router();

questionsRouter.get('/', Controllers.Questions.getQuestionsByUserId);

questionsRouter.post('/', Controllers.Questions.postQuestion);

questionsRouter.get('/review', Controllers.Questions.getReviewQuestions);

questionsRouter.get('/lc-info/:questId', Controllers.Questions.getQuestionInfo);

questionsRouter.get('/:questId', Controllers.Questions.getQuestion);

export default questionsRouter;
