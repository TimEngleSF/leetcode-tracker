import express from 'express';
import Controllers from '../controllers/index.js';
const leaderboardRouter = express.Router();

leaderboardRouter.get('/', Controllers.Leaderboard.getGeneralLeaderBoard);
leaderboardRouter.get('/:questID', Controllers.Leaderboard.getLeaderboardByNum);

export default leaderboardRouter;
