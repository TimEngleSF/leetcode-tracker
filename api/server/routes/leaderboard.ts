import express from 'express';
import Controllers from '../controllers/index.js';
const leaderboardRouter = express.Router();

leaderboardRouter.get('/', Controllers.Leaderboard.getGeneralLeaderBoard);

export default leaderboardRouter;
