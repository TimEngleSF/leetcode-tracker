import axios from 'axios';
import writeErrorToFile from '../../errors/writeError.js';
import { getAuthHeaders } from '../../utils.js';
import { differenceInDays } from 'date-fns';
import { getDisplayTextForUser, changeTextColorByRank } from '../utils.js';
import { initGeneralTable } from './helpers/utils.js';
import { API_URL } from '../../config.js';
import { GeneralLeaderboardAPIResponse } from '../../Types/api.js';
export const generalLeaderboard: any = async (
  getAuthHeadersInstance = getAuthHeaders,
  axiosInstance = axios,
  writeErrorInstance = writeErrorToFile
) => {
  try {
    const authHeader = await getAuthHeadersInstance();
    const { data } = (await axiosInstance({
      method: 'GET',
      url: `${API_URL}/leaderboard`,
      headers: { ...authHeader },
    })) as { data: GeneralLeaderboardAPIResponse };

    const completeLeaderData = data.leaderboard.map((leaderData) => {
      const lastActivity = differenceInDays(
        new Date(),
        new Date(leaderData.lastActivity)
      );
      return {
        name: leaderData.name,
        passed: leaderData.passedCount,
        lastActive: lastActivity === 0 ? 'Today' : `${lastActivity} days ago`,
        rank: leaderData.rank,
      };
    });

    const table = initGeneralTable();

    // TODO: Set this up using the new changeTextColor correctly
    completeLeaderData.forEach(({ rank, lastActive, name, passed }) => {
      const displayRank = changeTextColorByRank(rank, rank);
      const displayName = changeTextColorByRank(rank, name);
      const displayPassedCount = changeTextColorByRank(rank, passed);
      const displaylastActive = changeTextColorByRank(rank, lastActive);

      table.push([
        rank === 1 ? displayRank + ' ' + '🏆' : displayRank,
        displayName,
        displayPassedCount,
        displaylastActive,
      ]);
    });

    if (data.user) {
      console.log(`\n${getDisplayTextForUser(data.user)}\n`);
    }
    console.log(table.toString());
  } catch (error: any) {
    await writeErrorInstance(
      error,
      'Error arrised while executing generalLeaderBoard function'
    );
  }
};
