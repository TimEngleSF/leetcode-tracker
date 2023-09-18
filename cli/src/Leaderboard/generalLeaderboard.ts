import axios from 'axios';
import writeErrorToFile from '../errors/writeError.js';
import { getAuthHeaders } from '../utils.js';
import { differenceInDays } from 'date-fns';
import {
  getDisplayTextForUser,
  initGeneralTable,
  formatRank,
} from './helperFunc.js';

export const generalLeaderboard: any = async () => {
  try {
    const authHeader = await getAuthHeaders();
    const { data } = await axios({
      method: 'GET',
      url: 'http://localhost:3000/leaderboard',
      headers: { ...authHeader },
    });

    const completeLeaderData = await data.leaderboardData.map(
      (leaderData: {
        userId: string;
        name: string;
        passedCount: number;
        lastActivity: number;
      }) => {
        const lastActivity = differenceInDays(
          new Date(),
          new Date(leaderData.lastActivity)
        );
        return {
          name: leaderData.name,
          passed: leaderData.passedCount,
          lastActive: lastActivity === 0 ? 'Today' : `${lastActivity} days ago`,
        };
      }
    );

    const table = initGeneralTable();

    completeLeaderData.forEach((rowData: any, i: number) => {
      const rank = formatRank(i);

      table.push([rank, rowData.name, rowData.passed, rowData.lastActive]);
    });

    console.log(`\n${getDisplayTextForUser(data.userData)}\n`);
    console.log(table.toString());
  } catch (error: any) {
    console.log(error);
    await writeErrorToFile(
      error,
      'Error arrised while executing generalLeaderBoard function'
    );
  }
};
