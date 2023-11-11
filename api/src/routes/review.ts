import express from 'express';
import Controllers from '../controllers/index.js';
const reviewRouter = express.Router();

reviewRouter.get('/', Controllers.Review.getReviewQuestions);

export default reviewRouter;
