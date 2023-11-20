import { format } from 'date-fns';

import { getDisplayTextForUser, changeTextColorByRank } from '../../utils.js';
import { initQuestTable } from './utils.js';
import { QuestionLeaderboardAPIResponse } from '../../../Types/api.js';

export const createQuestLBDisplay = async ({
  user,
  leaderboard,
}: QuestionLeaderboardAPIResponse) => {
  const table = initQuestTable();

  leaderboard.forEach(({ rank, mostRecent, minSpeed, name, passedCount }) => {
    const displayRank = changeTextColorByRank(rank, rank);
    const displayName = changeTextColorByRank(rank, name);
    const displayPassedCount = changeTextColorByRank(rank, passedCount);
    const displayMinSpeed = changeTextColorByRank(
      rank,
      minSpeed ? `${minSpeed}ms` : 'N/A'
    );
    const displayMostRecent = changeTextColorByRank(
      rank,
      format(new Date(mostRecent), 'MM-dd-yyyy')
    );

    table.push([
      rank === 1 ? displayRank + ' ' + '🏆' : displayRank,
      displayName,
      displayPassedCount,
      displayMinSpeed,
      displayMostRecent,
    ]);
  });

  const userDisplayText = getDisplayTextForUser({
    rank: user.rank,
    name: user.name,
  });

  return { table, userDisplayText };
};
