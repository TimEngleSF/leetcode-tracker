import axios from 'axios';
import Table from 'cli-table3';
import chalk from 'chalk';
import { format } from 'date-fns';

import writeErrorToFile from '../errors/writeError.js';
import { getAuthHeaders, getUserJSON, printHeader } from '../utils.js';
import { selectQuestionNum } from './Prompts/selectQuestionNum.js';

export const questionLeaderboard: any = async () => {
  const gold = (str: string | number) => chalk.hex('#FFD700').bold(str);
  const silver = (str: string | number) => chalk.hex('#C0C0C0').bold(str);
  const bronze = (str: string | number) => chalk.hex('#cd7f32').bold(str);

  const { LC_ID } = await getUserJSON();
  try {
    const questID = await selectQuestionNum();
    const authHeader = await getAuthHeaders();
    const leaderData = await axios({
      method: 'GET',
      url: `http://localhost:3000/leaderboard/${questID}`,
      headers: { ...authHeader },
    });

    const getUserData = async (userID: string) =>
      await axios({
        method: 'GET',
        url: `http://localhost:3000/users/${userID}`,
        headers: { ...authHeader },
      });

    const rowData = await Promise.all(
      leaderData.data.map(
        async (userQuestData: {
          _id: string;
          passedCount: number;
          minSpeed: number;
          mostRecent: number;
        }) => {
          const { data } = await getUserData(userQuestData._id);

          return {
            userID: userQuestData._id,
            firstName: data.firstName,
            lastInit: data.lastInit,
            passedCount: userQuestData.passedCount,
            minSpeed: userQuestData.minSpeed,
            mostRecent: userQuestData.mostRecent,
          };
        }
      )
    );

    const table = new Table({
      head: [
        chalk.white('Rank'),
        chalk.white('User'),
        chalk.white('Times Passed'),
        chalk.white('Speed'),
        chalk.white('Most Recent Pass'),
      ],
      colWidths: [8, 10, 15, 8],
    });

    const userDisplayData = {};

    rowData
      .sort((a, b) => b.passedCount - a.passedCount)
      .forEach((row, i) => {
        console.log(row.userID, LC_ID);
        if (row.userID === LC_ID) {
          userDisplayData.rank = i + 1;
          userDisplayData.name = `${row.firstName} ${row.lastInit}.`;
        }
        const rank =
          i === 0
            ? gold(i + 1)
            : i === 1
            ? silver(i + 1)
            : i === 2
            ? bronze(i + 1)
            : i + 1;
        const name = `${row.firstName} ${row.lastInit}.`;
        const passedCount = row.passedCount;
        const minSpeed = row.minSpeed ? `${row.minSpeed}ms` : 'N/A';
        const mostRecent = format(new Date(row.mostRecent), 'MM-dd-yyyy');
        table.push([rank, name, passedCount, minSpeed, mostRecent]);
      });

    let userDisplayText = `${userDisplayData.name} you rank #${userDisplayData.rank}`;
    if (userDisplayData.rank === 1) {
      userDisplayText = gold(userDisplayText);
    } else if (userDisplayData.rank === 2) {
      userDisplayText = silver(userDisplayText);
    } else if (userDisplayData.rank === 3) {
      userDisplayText = bronze(userDisplayText);
    } else {
      console.log(userDisplayText);
    }

    console.clear();
    printHeader();
    console.log(userDisplayText);
    console.log(table.toString());
  } catch (error: any) {
    console.log(error);
    await writeErrorToFile(
      error,
      'Error arrised while executing generalLeaderBoard function'
    );
  }
};

// await generalLeaderboard();
