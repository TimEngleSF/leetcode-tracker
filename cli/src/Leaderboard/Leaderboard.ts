import { selectLeaderboard } from './Prompts/selectLeaderboardPrompt.js';
import { generalLeaderboard } from './generalLeaderboard/generalLeaderboard.js';
import { questionLeaderboard } from './questionLeaderboard/questionLeaderboard.js';

const Leaderboard = async () => {
  const answer = await selectLeaderboard();
  if (answer === 'general') {
    await generalLeaderboard();
  } else {
    await questionLeaderboard();
  }
};

export default Leaderboard;
