import express from 'express';
import Controllers from '../controllers/index.js';
const questionsRouter = express.Router();

questionsRouter.get('/', Controllers.Questions.getAllQuestionsByUser);
questionsRouter.get('/:id', Controllers.Questions.getQuestionDataForUser);
questionsRouter.get('/review', Controllers.Questions.getReviewQuestions);

questionsRouter.post('/add', Controllers.Questions.addQuestionData);

export default questionsRouter;
