import express from 'express';
import Controllers from '../controllers/index.js';
const questionsRouter = express.Router();

questionsRouter.get('/', Controllers.Questions.getAllQuestionsByUser);
questionsRouter.get('/:questID', Controllers.Questions.getQuestion);
questionsRouter.get('/review', Controllers.Questions.getReviewQuestions);
questionsRouter.get('/data/:questID', Controllers.Questions.getQuestionData);

questionsRouter.post('/add', Controllers.Questions.subQuestions.postQuestion);

export default questionsRouter;
