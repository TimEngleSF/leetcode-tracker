import express from 'express';
import Controllers from '../controllers/index.js';
const leaderboardRouter = express.Router();

leaderboardRouter.get('/', Controllers.Leaderboard.getGeneralLeaderboard);

leaderboardRouter.get(
  '/:questId',
  Controllers.Leaderboard.getQuestionLeaderboard
);

export default leaderboardRouter;
